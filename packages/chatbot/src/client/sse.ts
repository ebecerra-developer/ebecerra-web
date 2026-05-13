/**
 * Parser de SSE para el formato que emite nuestra API route
 * (definido en server/stream.ts):
 *
 *   data: {"type":"text","value":"…"}
 *   data: {"type":"done","model":"…"}
 *   data: {"type":"error","message":"…"}
 *
 * Devuelve un async iterator de eventos tipados.
 */

export type ChatbotStreamEvent =
  | { type: "text"; value: string }
  | { type: "done"; model: string }
  | { type: "error"; message: string };

export async function* readChatbotStream(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<ChatbotStreamEvent, void, void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) return;
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data) continue;
        try {
          yield JSON.parse(data) as ChatbotStreamEvent;
        } catch {
          // chunk corrupto: ignorar
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
