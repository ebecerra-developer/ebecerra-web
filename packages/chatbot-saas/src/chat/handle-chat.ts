import {
  streamGroqChat,
  toClientSSE,
  GroqExhaustedError,
  GroqHardError,
} from "@ebecerra/chatbot/server";
import {
  validateTenantKey,
  authContextFromRequest,
  InvalidTenantKeyError,
} from "../auth/tenant-key";
import { resolveConfig, ConfigNotFoundError } from "../config/resolver";
import { buildSystemPrompt } from "../config/prompt-builder";
import { assertQuota, QuotaExceededError } from "../usage/quota";
import { persistMessage } from "../db/messages";
import { incrementUsage } from "../db/usage";
import { logAudit } from "../db/audit";
import type { ChatMessage, ChatRequestBody } from "../types";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;

/**
 * Maneja un request POST /api/v1/chat completo.
 *
 * Pipeline:
 *  1. Validate tenant key (header X-Tenant-Key)
 *  2. Parse body, validar tamaños
 *  3. Check quota mensual
 *  4. Resolve config del tenant
 *  5. Build system prompt
 *  6. Stream desde Groq (cadena de modelos completa de @ebecerra/chatbot)
 *  7. Persistir mensajes user + assistant en chatbot_messages
 *  8. Increment chatbot_usage
 *  9. Audit log
 */
export async function handleChatRequest(request: Request): Promise<Response> {
  // 1. Auth
  let tenant;
  try {
    tenant = await validateTenantKey(
      request.headers.get("x-tenant-key"),
      authContextFromRequest(request, "/api/v1/chat")
    );
  } catch (e) {
    if (e instanceof InvalidTenantKeyError) {
      return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
    }
    throw e;
  }

  // 2. Parse body
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonError(400, "bad_request", "Invalid JSON body");
  }
  if (!body || typeof body !== "object") {
    return jsonError(400, "bad_request", "Body must be an object");
  }
  if (!body.sessionId || typeof body.sessionId !== "string") {
    return jsonError(400, "bad_request", "sessionId required");
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError(400, "bad_request", "messages array required");
  }

  const trimmedMessages = body.messages.slice(-MAX_HISTORY_MESSAGES);
  for (const m of trimmedMessages) {
    if (typeof m.content !== "string" || m.content.length === 0) {
      return jsonError(400, "bad_request", "messages must have non-empty content");
    }
    if (m.content.length > MAX_MESSAGE_LENGTH) {
      return jsonError(
        413,
        "payload_too_large",
        `Message exceeds max length of ${MAX_MESSAGE_LENGTH} chars`
      );
    }
  }

  // 3. Quota
  try {
    await assertQuota(tenant);
  } catch (e) {
    if (e instanceof QuotaExceededError) {
      await logAudit({
        tenant_id: tenant.id,
        action: "quota.exceeded",
        details: { current: e.current, limit: e.limit },
      });
      return jsonError(429, "quota_exceeded", `Quota exceeded: ${e.current}/${e.limit}`);
    }
    throw e;
  }

  // 4 + 5. Config + prompt
  let systemPrompt: string;
  try {
    const config = await resolveConfig(tenant);
    systemPrompt = buildSystemPrompt(config);
  } catch (e) {
    if (e instanceof ConfigNotFoundError) {
      return jsonError(
        503,
        "config_not_synced",
        "Chatbot config not yet synced. Try again in a moment."
      );
    }
    throw e;
  }

  // 6. Persistir mensaje user inmediatamente (antes de Groq)
  const lastUserMessage = trimmedMessages[trimmedMessages.length - 1];
  if (lastUserMessage.role === "user") {
    await persistMessage({
      tenant_id: tenant.id,
      session_id: body.sessionId,
      role: "user",
      content: lastUserMessage.content,
      origin: request.headers.get("referer") ?? null,
    }).catch((err) => {
      console.error("[chatbot-saas] persist user message failed:", err);
    });
  }

  // 7. Stream desde Groq (usa MODEL_CHAIN por defecto del paquete)
  const messagesForGroq: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...trimmedMessages,
  ];

  let groqResult;
  try {
    groqResult = await streamGroqChat({
      apiKey: requireEnv("GROQ_API_KEY"),
      messages: messagesForGroq,
    });
  } catch (e) {
    if (e instanceof GroqExhaustedError) {
      await logAudit({
        tenant_id: tenant.id,
        action: "chat.failed",
        details: { reason: "groq_exhausted", attempts: e.attempts },
      });
      return jsonError(503, "models_unavailable", "All models temporarily unavailable");
    }
    if (e instanceof GroqHardError) {
      await logAudit({
        tenant_id: tenant.id,
        action: "chat.failed",
        details: { reason: "groq_hard", model: e.model, status: e.status },
      });
      return jsonError(502, "upstream_error", "Upstream model error");
    }
    throw e;
  }

  // 8. SSE passthrough con callback al completar
  const tenantId = tenant.id;
  const sessionId = body.sessionId;
  const isNewConversation = trimmedMessages.length === 1;

  // Estimación rough de tokens — Groq no expone usage en SSE delta.
  // Heurística aceptada: ~4 chars por token. V2 puede usar tiktoken si interesa precisión.
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  const userText = lastUserMessage.role === "user" ? lastUserMessage.content : "";
  const tokensInput = estimateTokens(systemPrompt + userText);

  const sseStream = toClientSSE(groqResult.stream, groqResult.model, async (fullText, model) => {
    const tokensOutput = estimateTokens(fullText);

    await persistMessage({
      tenant_id: tenantId,
      session_id: sessionId,
      role: "assistant",
      content: fullText,
      model,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
    }).catch((err) =>
      console.error("[chatbot-saas] persist assistant message failed:", err)
    );

    await incrementUsage(tenantId, {
      messages: 2, // user + assistant
      tokens: tokensInput + tokensOutput,
      newConversation: isNewConversation,
    }).catch((err) =>
      console.error("[chatbot-saas] increment usage failed:", err)
    );

    await logAudit({
      tenant_id: tenantId,
      action: "chat.completed",
      details: {
        session_id: sessionId,
        model,
        tokens_in: tokensInput,
        tokens_out: tokensOutput,
      },
    });
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
