/**
 * Tipos compartidos entre cliente y servidor del chatbot.
 * No importar nada de React aquí — debe ser consumible desde Edge runtime.
 */

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

/**
 * Contexto que identifica desde qué app llega la conversación.
 * Permite al servidor inyectar instrucciones base distintas (tono comercial,
 * tono técnico, aviso de "soy una demo de ebecerra.es", etc.).
 */
export type ChatbotContext = "es" | "tech" | "demo";

/**
 * Payload que envía el cliente a /api/chat.
 */
export type ChatRequestBody = {
  messages: ChatMessage[];
  /** Locale del usuario (es | en). Inyectado en el system prompt. */
  locale: string;
};
