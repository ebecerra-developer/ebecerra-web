/**
 * Cadena de modelos de Groq en orden de preferencia.
 *
 * El runtime intenta cada modelo en orden. Si recibe 429 (rate limit) o
 * un error de cuota, salta al siguiente. La siguiente petición vuelve a
 * empezar por el primero — sin estado compartido.
 *
 * Razonamiento del orden (límites del free tier, fuente: consola Groq):
 *
 * 1. llama-3.3-70b-versatile     → mejor calidad conversacional (12K TPM, 100K TPD).
 * 2. llama-4-scout-17b-16e       → buena calidad y TPM/TPD altísimos (30K/500K).
 *                                  Absorbe picos cuando el 70B se queda sin tokens.
 * 3. openai/gpt-oss-120b         → modelo grande de otro vendor (cuota distinta).
 * 4. qwen/qwen3-32b              → único con 60 RPM, ayuda en ráfagas.
 * 5. openai/gpt-oss-20b          → backup ligero.
 * 6. llama-3.1-8b-instant        → último recurso. RPD muy alto (14.4K) — sobrevive
 *                                  cuando todo lo demás agota el límite diario.
 */
export const MODEL_CHAIN = [
  "llama-3.3-70b-versatile",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "openai/gpt-oss-120b",
  "qwen/qwen3-32b",
  "openai/gpt-oss-20b",
  "llama-3.1-8b-instant",
] as const;

export type GroqModel = (typeof MODEL_CHAIN)[number];
