import { serverEnv } from "./env";

export type ChatbotApp = "es" | "tech" | "demos" | "llaullau";
export type ChatbotRole = "user" | "assistant";

type LogEntry = {
  session_id: string;
  app: ChatbotApp;
  role: ChatbotRole;
  content: string;
  model?: string;
};

/**
 * Inserta un mensaje en `chatbot_messages` vía PostgREST.
 * Fire-and-forget — los fallos se registran en consola pero NO se propagan al
 * caller, para no romper el stream del chat por un problema de logging.
 *
 * Si faltan las env vars de Supabase, la función no hace nada (logging opt-in).
 */
export async function logChatbotMessage(entry: LogEntry): Promise<void> {
  const env = serverEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    return;
  }

  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/chatbot_messages`,
      {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(entry),
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        "[logChatbotMessage] Supabase rejected insert:",
        res.status,
        body.slice(0, 200)
      );
    }
  } catch (err) {
    console.error("[logChatbotMessage] failed:", err);
  }
}
