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
import { getDemoSiteBySlug } from "@ebecerra/sanity-client";
import { serverEnv } from "@/lib/env";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const payloadSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  locale: z.string().min(2).max(8).default("es"),
  /**
   * Slug del demoSite — necesario para cargar el system prompt específico
   * del negocio ficticio. Lo inyecta el componente cliente al montarse.
   */
  demoSlug: z.string().min(1).max(120),
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

  const { messages, locale, demoSlug } = parsed.data;

  const demo = await getDemoSiteBySlug(demoSlug, locale).catch(() => null);
  if (!demo) {
    return NextResponse.json({ message: "demo not found" }, { status: 404 });
  }

  const systemPrompt = buildSystemPrompt({
    context: "demo",
    businessContext: demo.chatbot?.systemPrompt ?? null,
  });

  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  try {
    const { stream, model } = await streamGroqChat({
      apiKey: env.GROQ_API_KEY,
      messages: fullMessages,
    });

    return new Response(toClientSSE(stream, model), {
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
