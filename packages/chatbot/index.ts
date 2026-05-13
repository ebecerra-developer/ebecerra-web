// Re-export shared types desde la raíz. El cliente y el servidor tienen
// entry points dedicados (./client, ./server) para no mezclar dependencias
// React con código de Edge runtime.
export type { ChatMessage, ChatRole, ChatbotContext } from "./src/types";
