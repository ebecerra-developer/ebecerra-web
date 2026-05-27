/**
 * Llamada one-shot a Groq con response_format JSON.
 * Diferente del streaming que usa el chatbot — aquí queremos UN solo objeto
 * estructurado, no tokens en streaming.
 */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Cadena con fallback — si el primary devuelve 429/5xx, salta al siguiente.
const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
] as const;

const FALLBACK_STATUSES = new Set([429, 500, 502, 503, 504]);

export async function callGroqJson(args: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ json: unknown; model: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no configurado en el entorno");

  let lastError = "";
  for (const model of MODELS) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: args.systemPrompt },
          { role: "user", content: args.userPrompt },
        ],
        max_tokens: args.maxTokens ?? 800,
        temperature: args.temperature ?? 0.85,
        response_format: { type: "json_object" },
        stream: false,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content ?? "";
      try {
        return { json: JSON.parse(content), model };
      } catch {
        throw new Error(`Groq devolvió JSON inválido: ${content.slice(0, 200)}`);
      }
    }

    const body = await res.text().catch(() => "");
    lastError = `${model} → ${res.status}: ${body.slice(0, 200)}`;
    if (FALLBACK_STATUSES.has(res.status)) continue;
    throw new Error(`Groq error ${res.status} en ${model}: ${body.slice(0, 300)}`);
  }

  throw new Error(`Todos los modelos Groq fallaron. Último error: ${lastError}`);
}
