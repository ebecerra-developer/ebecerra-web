import {
  verifySanityWebhookSignature,
  handleSyncWebhook,
} from "@ebecerra/chatbot-saas/sanity-sync";
import {
  validateTenantKey,
  authContextFromRequest,
  InvalidTenantKeyError,
} from "@ebecerra/chatbot-saas/auth";

/**
 * POST /api/saas/sync-config
 *
 * Receptor de webhooks de Sanity. Cuando un cliente publica un documento de tipo
 * profile, demoSite o chatbotConfig, este endpoint actualiza chatbot_configs_cache
 * del tenant correspondiente.
 *
 * Auth: HMAC-SHA256 del raw body con SANITY_WEBHOOK_SECRET (header sanity-webhook-signature).
 *
 * El sanity_project_id viene como query string (?project=<id>) o por header custom
 * — Sanity no incluye projectId en el body por defecto. El webhook se configura en
 * Sanity Manage UI con la URL completa que ya lleva el projectId.
 *
 * Ejemplo:
 *   https://chats.ebecerra.es/api/saas/sync-config?project=gdtxcn4l
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const sanityProjectId = url.searchParams.get("project");
  if (!sanityProjectId) {
    return jsonError(400, "missing_project", "?project= query string required");
  }

  const rawBody = await request.text();

  // Auth: dos modos, en orden de preferencia.
  //  1. HMAC signature (`sanity-webhook-signature` header): webhook directo de Sanity.
  //  2. X-Tenant-Key: forward desde el /api/revalidate de un cliente con tenant key
  //     (caso típico: llaullau, donde el webhook de Sanity llega a su /api/revalidate
  //     y este reenvía el doc aquí). Sanity free tier solo permite 2 webhooks → reusamos
  //     el de revalidate como fan-in.
  const signatureHeader = request.headers.get("sanity-webhook-signature");
  const tenantKeyHeader = request.headers.get("x-tenant-key");

  if (signatureHeader) {
    const secret = process.env.SANITY_WEBHOOK_SECRET;
    if (!secret) {
      return jsonError(500, "config_error", "Server missing SANITY_WEBHOOK_SECRET");
    }
    const valid = verifySanityWebhookSignature({
      rawBody,
      signatureHeader,
      secret,
    });
    if (!valid) {
      return jsonError(401, "invalid_signature", "Webhook signature invalid or expired");
    }
  } else if (tenantKeyHeader) {
    try {
      await validateTenantKey(
        tenantKeyHeader,
        authContextFromRequest(request, "/api/saas/sync-config")
      );
    } catch (e) {
      if (e instanceof InvalidTenantKeyError) {
        return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
      }
      throw e;
    }
  } else {
    return jsonError(401, "missing_auth", "Provide sanity-webhook-signature or X-Tenant-Key");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }

  if (!payload || typeof payload !== "object" || !(payload as { _id?: unknown })._id) {
    return jsonError(400, "missing_id", "Payload must include _id");
  }

  const result = await handleSyncWebhook({
    sanityProjectId,
    payload: payload as { _id: string; _type: string; _rev?: string },
  });

  if (!result.ok) {
    console.warn("[sync-config] skip:", result.reason);
    return Response.json({ ok: false, reason: result.reason }, { status: 200 });
    // Devolver 200 para que Sanity no reintente. El skip es esperado para docs no-tenant.
  }

  return Response.json({ ok: true, tenant_ids: result.tenantIds, action: result.action });
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
