import { defineType, defineField } from "sanity";

// Landing de captación SEO por SECTOR (reutilizable): /diseno-web-para-{sector}.
// Mismo patrón que landingMadrid pero como COLECCIÓN: cada sector (gestorías,
// fisios, entrenadores…) es un documento nuevo, sin tocar código. Carril SEO
// long-tail local-sector ("diseño web para gestorías Madrid"), no el genérico
// nacional. NO enlazar en nav/hero — solo footer + sitemap + posts del racimo.
// Copy veraz, sin jerga ni anglicismos. Público: autónomos/PYMEs del sector.
export default defineType({
  name: "sectorLanding",
  title: "Landing · Sector",
  type: "document",
  fields: [
    defineField({
      name: "internalName",
      title: "Nombre interno",
      description: "Solo para el Studio (ej: Gestorías, Fisioterapeutas).",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      description: 'Ruta final, ej: "diseno-web-para-gestorias".',
      type: "slug",
      options: { source: "internalName", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaTitle",
      title: "Meta title",
      description: "~55-60 car., liderando con la keyword del sector + sitio.",
      type: "localeString",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      description: "~150 car., keyword del sector + propuesta de valor.",
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
      description: 'Incluir "diseño web" + el sector de forma natural.',
      type: "localeString",
    }),
    defineField({
      name: "lead",
      title: "Lead / entradilla",
      description: "El dolor del sector + qué resuelves. Cercanía local + remoto.",
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
      description: "Lo real que ya ofreces, aterrizado al sector.",
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
      description: "Menciona la demo real del sector si la hay.",
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
      description: "Preguntas tipo '¿cuánto cuesta una web para mi gestoría?'.",
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
  ],
  preview: {
    select: { title: "internalName", subtitle: "slug.current" },
    prepare: ({ title, subtitle }) => ({
      title: `Landing · ${title || "Sector"}`,
      subtitle: subtitle ? `/${subtitle}` : undefined,
    }),
  },
});
