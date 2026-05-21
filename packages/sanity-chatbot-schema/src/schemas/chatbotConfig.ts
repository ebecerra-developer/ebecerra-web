import { defineType, defineField } from "sanity";

/**
 * Singleton de configuración del chatbot del tenant.
 *
 * Cada tenant externo (con su propio Sanity) tiene UN documento de este tipo.
 * Al publicar, Sanity dispara webhook a chats.ebecerra.es/api/saas/sync-config
 * y el contenido se cachea en Supabase central (chatbot_configs_cache).
 *
 * Los apps internos del monorepo NO usan este schema — usan el objeto `chatbot`
 * embebido en profile/demoSite vía @ebecerra/sanity-schemas.
 */
export default defineType({
  name: "chatbotConfig",
  title: "Chatbot · Configuración",
  type: "document",
  // Singleton: el cliente solo verá uno en Structure.
  // La protección "no permitir crear más" se implementa en sanity-config del cliente.
  fields: [
    defineField({
      name: "systemPrompt",
      title: "Contexto e instrucciones (system prompt)",
      description:
        "Información del negocio: servicios, tono, qué hace, qué no hace, qué redirige a contacto humano. El backend añade reglas técnicas (no inventar precios, ceñirse al contexto) automáticamente.",
      type: "localeText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "greeting",
      title: "Saludo inicial",
      description: "Primer mensaje del bot al abrir el chat.",
      type: "localeText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tone",
      title: "Tono",
      type: "string",
      options: {
        list: [
          { title: "Cordial", value: "cordial" },
          { title: "Formal", value: "formal" },
          { title: "Cercano", value: "cercano" },
          { title: "Técnico", value: "tecnico" },
        ],
        layout: "radio",
      },
      initialValue: "cordial",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "language",
      title: "Idioma principal",
      type: "string",
      options: {
        list: [
          { title: "Español", value: "es" },
          { title: "English", value: "en" },
        ],
      },
      initialValue: "es",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "businessInfo",
      title: "Datos del negocio",
      type: "chatbotBusinessInfo",
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      description:
        "Preguntas frecuentes del negocio. El bot las inyecta como contexto al responder. Empieza por las 5-8 que más te repitan por WhatsApp.",
      type: "array",
      of: [{ type: "chatbotFaq" }],
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "branding",
      title: "Branding del widget",
      type: "chatbotBranding",
    }),
    defineField({
      name: "model",
      title: "Modelo LLM (avanzado)",
      description:
        "Por defecto el sistema usa una cadena de fallback. Este campo está reservado para overrides futuros — déjalo vacío en V1.",
      type: "string",
      readOnly: true,
    }),
  ],
  preview: {
    prepare: () => ({ title: "Chatbot · Configuración" }),
  },
});
