import type { ChatbotConfig } from "../types";

const TONE_GUIDANCE: Record<ChatbotConfig["tone"], string> = {
  cordial: "Tono cordial y profesional, cercano pero respetuoso. Usa 'tú' por defecto.",
  formal: "Tono formal y profesional. Usa 'usted' por defecto.",
  cercano: "Tono cercano, informal y empático. Usa 'tú' y un lenguaje conversacional.",
  tecnico: "Tono técnico y directo. Asume conocimiento previo del usuario.",
};

/**
 * Reglas base aplicadas a todo chatbot multi-tenant. Independientes del idioma.
 * El backend siempre añade estas reglas — el cliente no puede sobreescribirlas.
 */
const BASE_RULES = [
  "Eres un asistente virtual de un negocio real. Tu rol es responder preguntas sobre el negocio con la información que tienes en este contexto.",
  "No inventes datos: si no tienes la información en el contexto, dilo claramente y ofrece el canal de contacto humano (WhatsApp, email).",
  "Si alguien pide precios concretos, presupuestos o cosas que requieran negociación, no improvises — redirige al canal de contacto.",
  "Mantén respuestas concisas (1-3 párrafos cortos como máximo). Usa listas solo cuando el usuario pida pasos o enumeraciones.",
  "Responde en el mismo idioma del último mensaje del usuario.",
  "No uses Markdown elaborado. Texto plano o guiones es suficiente.",
];

/**
 * Construye el system prompt completo a partir de la config del tenant.
 *
 * Estructura:
 *   1. Reglas base (siempre)
 *   2. Tono y idioma (de la config)
 *   3. Información del negocio (estructurada)
 *   4. FAQs (si las hay)
 *   5. System prompt custom del cliente (lo último — es el contexto editorial)
 */
export function buildSystemPrompt(config: ChatbotConfig): string {
  const sections: string[] = [];

  sections.push("# Instrucciones");
  sections.push(BASE_RULES.map((r) => `- ${r}`).join("\n"));

  sections.push("\n# Tono y estilo");
  sections.push(`- ${TONE_GUIDANCE[config.tone]}`);
  sections.push(`- Idioma principal: ${config.language === "es" ? "español" : "inglés"}.`);

  const bi = config.business_info ?? {};
  const businessLines: string[] = [];
  if (bi.name) businessLines.push(`Nombre: ${bi.name}`);
  if (bi.description) businessLines.push(`Descripción: ${bi.description}`);
  if (bi.address) businessLines.push(`Dirección: ${bi.address}`);
  if (bi.hours) businessLines.push(`Horario: ${bi.hours}`);
  if (bi.services) businessLines.push(`Servicios: ${bi.services}`);
  if (bi.contactWhatsapp) businessLines.push(`WhatsApp: ${bi.contactWhatsapp}`);
  if (bi.contactEmail) businessLines.push(`Email: ${bi.contactEmail}`);

  if (businessLines.length > 0) {
    sections.push("\n# Información del negocio");
    sections.push(businessLines.join("\n"));
  }

  if (config.faqs && config.faqs.length > 0) {
    sections.push("\n# Preguntas frecuentes");
    sections.push(
      config.faqs
        .map((f, i) => `${i + 1}. P: ${f.question}\n   R: ${f.answer}`)
        .join("\n\n")
    );
  }

  if (config.system_prompt?.trim()) {
    sections.push("\n# Contexto adicional");
    sections.push(config.system_prompt.trim());
  }

  return sections.join("\n");
}
