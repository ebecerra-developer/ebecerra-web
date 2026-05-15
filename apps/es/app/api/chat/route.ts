import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  buildSystemPrompt,
  streamGroqChat,
  toClientSSE,
  GroqExhaustedError,
  GroqHardError,
  type ChatMessage,
} from "@ebecerra/chatbot/server";
import { getProfileChatbot } from "@ebecerra/sanity-client";
import { serverEnv } from "@/lib/env";
import { logChatbotMessage } from "@/lib/chatbot-log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const payloadSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  locale: z.string().min(2).max(8).default("es"),
  sessionId: z.string().min(8).max(64).optional(),
});

export async function POST(request: NextRequest) {
  const env = serverEnv();
  if (!env.GROQ_API_KEY) {
    return NextResponse.json(
      { message: "chatbot disabled (missing GROQ_API_KEY)" },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "invalid payload", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { messages, locale, sessionId } = parsed.data;

  // Contexto editorial del bot (system prompt del negocio) viene de Sanity.
  const chatbotConfig = await getProfileChatbot(locale).catch(() => null);

  const systemPrompt = buildSystemPrompt({
    context: "es",
    businessContext: chatbotConfig?.systemPrompt ?? null,
  });

  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  // Logging opt-in: solo si llega sessionId y las env vars de Supabase están.
  // El último mensaje del array es siempre el que el usuario acaba de enviar
  // (el resto es histórico que ya se loguearon en turnos anteriores).
  const loggingEnabled =
    !!sessionId && !!env.NEXT_PUBLIC_SUPABASE_URL && !!env.SUPABASE_SECRET_KEY;
  if (loggingEnabled) {
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === "user") {
      void logChatbotMessage({
        session_id: sessionId,
        app: "es",
        role: "user",
        content: lastUserMessage.content,
      });
    }
  }

  try {
    const { stream, model } = await streamGroqChat({
      apiKey: env.GROQ_API_KEY,
      messages: fullMessages,
    });

    const onComplete = loggingEnabled
      ? (fullText: string, modelUsed: string) =>
          logChatbotMessage({
            session_id: sessionId!,
            app: "es",
            role: "assistant",
            content: fullText,
            model: modelUsed,
          })
      : undefined;

    return new Response(toClientSSE(stream, model, onComplete), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    if (err instanceof GroqExhaustedError) {
      console.error("[/api/chat] all models exhausted:", err.attempts);
      return NextResponse.json(
        {
          message:
            "El chat está saturado en este momento. Inténtalo en unos minutos.",
        },
        { status: 503 }
      );
    }
    if (err instanceof GroqHardError) {
      console.error("[/api/chat] hard error:", err.model, err.status, err.body);
      return NextResponse.json(
        { message: "Error del proveedor de IA." },
        { status: 502 }
      );
    }
    console.error("[/api/chat] unexpected:", err);
    return NextResponse.json(
      { message: "Error inesperado." },
      { status: 500 }
    );
  }
}
