import type { ChatbotContext } from "../types";

/**
 * Reglas base aplicadas a todo chatbot, sin importar el contexto.
 * Independientes del idioma — los modelos siguen estas instrucciones igual.
 */
const BASE_RULES = [
  "Eres un asistente de recepción virtual. Tu rol es responder preguntas frecuentes con tono cercano y profesional, no cerrar ventas.",
  "Si alguien pide precios concretos, presupuestos, condiciones de pago o cosas que requieran negociación humana, redirige amablemente al canal de contacto correspondiente. No inventes precios.",
  "Mantén respuestas concisas (1–3 párrafos cortos como máximo). Usa listas solo si el usuario pide pasos o enumeraciones explícitas.",
  "No inventes datos: si no tienes la información, dilo y ofrece el canal de contacto.",
  "Responde en el mismo idioma del último mensaje del usuario.",
  "No uses Markdown elaborado. Texto plano o listas con guiones es suficiente.",
];

/**
 * Instrucciones específicas por contexto.
 * - es / tech: bot oficial de ebecerra.es / ebecerra.tech.
 * - demo: bot embebido en una demo de venta — debe mencionar que es una demo.
 */
const CONTEXT_RULES: Record<ChatbotContext, string[]> = {
  es: [
    "Estás integrado en ebecerra.es, la web profesional de Enrique Becerra (desarrollo web freelance para autónomos y PYMEs).",
    "Si detectas intención de contratar o pedir presupuesto, sugiere ir al formulario de contacto en /#contacto.",
  ],
  tech: [
    "Estás integrado en ebecerra.tech, la web técnica de Enrique Becerra (Tech Architect, especialista en Magnolia CMS).",
    "Puedes hablar con tono más técnico: stacks, frameworks, arquitectura. El público aquí es técnico.",
    "Si detectas intención comercial, redirige a ebecerra.es.",
  ],
  demo: [
    "IMPORTANTE: estás embebido en una **demo** de web hecha por ebecerra.es. El negocio del que hablas no es real — es una plantilla de ejemplo.",
    "Si el usuario muestra interés en tener una web parecida para su propio negocio, indícale amablemente que esta es una demo de ebecerra.es y que puede contactar en ebecerra.es para una web a medida.",
    "El resto del tiempo, actúa como recepción del negocio ficticio: responde sobre sus servicios, horarios, etc., usando solo la información del contexto del negocio.",
  ],
};

/**
 * Compone el system prompt completo para una petición.
 *
 * Estructura:
 *   1. Reglas base (siempre).
 *   2. Reglas del contexto (es | tech | demo).
 *   3. Contexto editorial del negocio (viene de Sanity, editable sin redeploy).
 */
export function buildSystemPrompt(args: {
  context: ChatbotContext;
  /** systemPrompt del documento de Sanity. Puede ser null. */
  businessContext: string | null;
}): string {
  const sections: string[] = [];

  sections.push("# Instrucciones");
  sections.push(BASE_RULES.map((r) => `- ${r}`).join("\n"));

  sections.push("\n# Contexto de la web");
  sections.push(CONTEXT_RULES[args.context].map((r) => `- ${r}`).join("\n"));

  if (args.businessContext?.trim()) {
    sections.push("\n# Información del negocio");
    sections.push(args.businessContext.trim());
  }

  return sections.join("\n");
}
