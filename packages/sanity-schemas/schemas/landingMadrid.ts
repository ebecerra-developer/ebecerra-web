import { defineType, defineField } from "sanity";

// Landing de captación SEO local: /diseno-web-madrid (singleton).
// Página dedicada para la intención "diseño web Madrid" sin convertir la marca
// en "solo Madrid": el posicionamiento sigue siendo nacional (remoto para toda
// España). NO enlazar en nav/hero — solo footer + sitemap. Copy veraz, sin jerga.
export default defineType({
  name: "landingMadrid",
  title: "Landing · Diseño web Madrid",
  type: "document",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      description: "~55-60 car., liderando con la keyword (Diseño web en Madrid…).",
      type: "localeString",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      description: "~150 car., keyword + propuesta de valor.",
      type: "localeText",
    }),
    defineField({
      name: "kicker",
      title: "Kicker (estrella ✦)",
      type: "localeString",
    }),
    defineField({
      name: "title",
      title: "Título (H1)",
      description: 'Incluir "diseño web" + "Madrid" de forma natural.',
      type: "localeString",
    }),
    defineField({
      name: "lead",
      title: "Lead / entradilla",
      description: "Dejar claro: hecho en Madrid y también en remoto para toda España.",
      type: "localeText",
    }),
    defineField({
      name: "intro",
      title: "Intro (párrafos)",
      type: "array",
      of: [
        {
          type: "object",
          name: "para",
          title: "Párrafo",
          fields: [{ name: "text", title: "Texto", type: "localeText" }],
          preview: {
            select: { title: "text.es" },
            prepare: ({ title }) => ({ title: title || "Párrafo" }),
          },
        },
      ],
    }),
    defineField({
      name: "servicesTitle",
      title: "Servicios — título",
      type: "localeString",
    }),
    defineField({
      name: "services",
      title: "Servicios / qué incluye",
      description: "Lo real que ya ofreces (web a medida, IA, SEO, reservas…).",
      type: "array",
      of: [
        {
          type: "object",
          name: "service",
          title: "Servicio",
          fields: [
            { name: "title", title: "Título", type: "localeString" },
            { name: "body", title: "Texto", type: "localeText" },
          ],
          preview: { select: { title: "title.es", subtitle: "body.es" } },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "reachTitle",
      title: "Local + remoto — título",
      type: "localeString",
    }),
    defineField({
      name: "reachBody",
      title: "Local + remoto — párrafos",
      description: "Cercanía si eres de Madrid, sin excluir al resto de España.",
      type: "array",
      of: [
        {
          type: "object",
          name: "para",
          title: "Párrafo",
          fields: [{ name: "text", title: "Texto", type: "localeText" }],
          preview: {
            select: { title: "text.es" },
            prepare: ({ title }) => ({ title: title || "Párrafo" }),
          },
        },
      ],
    }),
    defineField({
      name: "diffTitle",
      title: "Diferenciación — título",
      type: "localeString",
    }),
    defineField({
      name: "diffItems",
      title: "Diferenciación / por qué yo",
      description: "Sin plantillas, sin permanencias, trato 1:1…",
      type: "array",
      of: [
        {
          type: "object",
          name: "diff",
          title: "Punto",
          fields: [
            { name: "title", title: "Título", type: "localeString" },
            { name: "body", title: "Texto", type: "localeText" },
          ],
          preview: { select: { title: "title.es", subtitle: "body.es" } },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "examplesTitle",
      title: "Ejemplos — título",
      type: "localeString",
    }),
    defineField({
      name: "examplesBody",
      title: "Ejemplos — texto",
      type: "localeText",
    }),
    defineField({
      name: "examplesCtaLabel",
      title: "Ejemplos — texto del enlace",
      type: "localeString",
    }),
    defineField({
      name: "faqTitle",
      title: "FAQ — título",
      type: "localeString",
    }),
    defineField({
      name: "faqItems",
      title: "FAQ",
      description: "Preguntas tipo '¿cuánto cuesta una web en Madrid?'.",
      type: "array",
      of: [
        {
          type: "object",
          name: "qa",
          title: "Pregunta",
          fields: [
            { name: "question", title: "Pregunta", type: "localeString" },
            { name: "answer", title: "Respuesta", type: "localeText" },
          ],
          preview: { select: { title: "question.es", subtitle: "answer.es" } },
        },
      ],
    }),
    defineField({
      name: "closingTitle",
      title: "Cierre — título",
      type: "localeString",
    }),
    defineField({
      name: "closingBody",
      title: "Cierre — texto",
      type: "localeText",
    }),
    defineField({
      name: "closingCtaLabel",
      title: "Cierre — texto del botón",
      type: "localeString",
    }),
  ],
  preview: { prepare: () => ({ title: "Landing · Diseño web Madrid" }) },
});
