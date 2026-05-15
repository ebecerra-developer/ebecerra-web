import type { GroqModel } from "./models";

export type StreamCompleteCallback = (
  fullText: string,
  model: GroqModel
) => void | Promise<void>;

/**
 * Transforma el stream SSE de Groq (formato OpenAI: `data: {choices:[{delta:{content}}]}`)
 * en un stream SSE simple para el cliente con dos tipos de evento:
 *
 *   data: {"type":"text","value":"…"}
 *   data: {"type":"done","model":"…"}
 *
 * Mantiene el formato Server-Sent Events estándar (líneas `data: …\n\n`).
 *
 * Si se pasa `onComplete`, se invoca con el texto completo del assistant cuando
 * el stream termina con éxito (no se llama si hay error). Útil para loguear la
 * conversación a posteriori sin acoplar el package a ningún backend de storage.
 */
export function toClientSSE(
  groqStream: ReadableStream<Uint8Array>,
  model: GroqModel,
  onComplete?: StreamCompleteCallback
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let buffer = "";
  let assembled = "";

  return new ReadableStream({
    async start(controller) {
      const reader = groqStream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // última línea incompleta se reserva

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const text = json.choices?.[0]?.delta?.content;
              if (text) {
                assembled += text;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "text", value: text })}\n\n`
                  )
                );
              }
            } catch {
              // chunk corrupto: ignorar y seguir
            }
          }
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done", model })}\n\n`
          )
        );
        if (onComplete && assembled.length > 0) {
          // Fire-and-forget: cualquier fallo del logger no debe romper el stream ya cerrado.
          Promise.resolve(onComplete(assembled, model)).catch((err) => {
            console.error("[toClientSSE] onComplete failed:", err);
          });
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: err instanceof Error ? err.message : "stream error",
            })}\n\n`
          )
        );
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}
