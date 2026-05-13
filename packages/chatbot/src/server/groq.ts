import type { ChatMessage } from "../types";
import { MODEL_CHAIN, type GroqModel } from "./models";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Errores que indican "este modelo no puede atender ahora mismo, prueba el siguiente".
 * - 429: rate limit (RPM/TPM/RPD/TPD).
 * - 503 / 502 / 500: incidencia transitoria del modelo concreto.
 *
 * Para errores 4xx distintos (400 mensaje mal formado, 401 key inválida) no
 * tiene sentido reintentar con otro modelo — se propaga.
 */
const SHOULD_FALLBACK_STATUSES = new Set([429, 500, 502, 503, 504]);

export class GroqExhaustedError extends Error {
  constructor(
    public readonly attempts: { model: GroqModel; status: number; reason: string }[]
  ) {
    super(
      `Todos los modelos de la cadena fallaron. Intentos: ${attempts
        .map((a) => `${a.model} (${a.status})`)
        .join(" → ")}`
    );
    this.name = "GroqExhaustedError";
  }
}

export class GroqHardError extends Error {
  constructor(
    public readonly model: GroqModel,
    public readonly status: number,
    public readonly body: string
  ) {
    super(`Groq devolvió ${status} en ${model}: ${body}`);
    this.name = "GroqHardError";
  }
}

type StreamArgs = {
  apiKey: string;
  messages: ChatMessage[];
  /** Override opcional de la cadena. Por defecto, MODEL_CHAIN. */
  models?: readonly GroqModel[];
  /** Máx. tokens en la respuesta. Default 600 (suficiente para FAQ). */
  maxTokens?: number;
  /** Temperatura. Default 0.5 — balance entre coherencia y naturalidad. */
  temperature?: number;
};

/**
 * Llama a Groq con streaming. Itera la cadena de modelos:
 *   - Si la respuesta empieza OK (200), devuelve el ReadableStream del body.
 *   - Si recibe un status de fallback (429/5xx), salta al siguiente.
 *   - Si todos fallan, lanza GroqExhaustedError.
 *   - Si recibe un error que no debe reintentarse (auth, payload), lanza GroqHardError.
 *
 * El streaming SSE en sí (parse de chunks `data: {...}\n\n`) se hace en la
 * API route — esta función solo devuelve la respuesta cruda y el modelo elegido.
 */
export async function streamGroqChat(args: StreamArgs): Promise<{
  stream: ReadableStream<Uint8Array>;
  model: GroqModel;
}> {
  const models = args.models ?? MODEL_CHAIN;
  const attempts: { model: GroqModel; status: number; reason: string }[] = [];

  for (const model of models) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: args.messages,
        stream: true,
        max_tokens: args.maxTokens ?? 600,
        temperature: args.temperature ?? 0.5,
      }),
    });

    if (res.ok && res.body) {
      return { stream: res.body, model };
    }

    const bodyText = await res.text().catch(() => "");
    if (SHOULD_FALLBACK_STATUSES.has(res.status)) {
      attempts.push({ model, status: res.status, reason: bodyText.slice(0, 200) });
      continue;
    }

    // 4xx distinto de 429: error duro, no reintentar.
    throw new GroqHardError(model, res.status, bodyText.slice(0, 500));
  }

  throw new GroqExhaustedError(attempts);
}
