import { defineType, defineField } from "sanity";

/**
 * Configuración del chatbot embebido en la web.
 *
 * Se incluye como objeto en otros documentos (profile, demoSite) para que
 * cada contexto edite su propio chatbot sin duplicar singletons.
 *
 * Lo que vive aquí es **contenido editorial**: saludo, placeholder, contexto
 * de negocio (system prompt) y avisos. La cadena de modelos y las
 * instrucciones técnicas (idioma, límites, "soy una demo de ebecerra.es")
 * viven en código (`@ebecerra/chatbot`).
 */
export default defineType({
  name: "chatbot",
  title: "Chatbot",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "enabled",
      title: "Activar chatbot",
      description: "Si está desactivado, no se renderiza en la página.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "label",
      title: "Etiqueta del botón flotante",
      description: "Texto corto que acompaña al botón. Ej: '¿Te ayudo?'",
      type: "localeString",
    }),
    defineField({
      name: "title",
      title: "Título del drawer",
      description: "Cabecera dentro del chat. Ej: 'Recepción · Equilibrio'.",
      type: "localeString",
    }),
    defineField({
      name: "greeting",
      title: "Saludo inicial",
      description: "Primer mensaje del bot al abrir el chat.",
      type: "localeText",
    }),
    defineField({
      name: "placeholder",
      title: "Placeholder del input",
      description: "Ej: 'Escribe tu pregunta…'",
      type: "localeString",
    }),
    defineField({
      name: "systemPrompt",
      title: "Contexto de negocio (system prompt)",
      description:
        "Información que el bot debe conocer del negocio: servicios, horarios, FAQ, tono, qué no debe hacer (cerrar precios, etc.). No incluye instrucciones técnicas — esas las añade el servidor.",
      type: "localeText",
    }),
    defineField({
      name: "disclaimers",
      title: "Avisos al usuario",
      description:
        "Textos cortos bajo la conversación. Ej: 'Bot conversacional, puede equivocarse', 'Demo de ebecerra.es'.",
      type: "array",
      of: [{ type: "localeString" }],
      validation: (Rule) => Rule.max(3),
    }),
  ],
});
