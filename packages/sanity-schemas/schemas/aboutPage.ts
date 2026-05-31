import { defineType, defineField } from "sanity";

// Página /sobre-mi — historia personal de Enrique (no un CV técnico).
// Singleton. Reutiliza foto + cifras del documento `profile` en el front.
export default defineType({
  name: "aboutPage",
  title: "Página Sobre mí (meta + contenido)",
  type: "document",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "localeString",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
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
      type: "localeString",
    }),
    defineField({
      name: "lead",
      title: "Lead / entradilla",
      type: "localeText",
    }),
    defineField({
      name: "intro",
      title: "Tu historia (párrafos)",
      description:
        "El relato personal. Cada bloque es un párrafo. Tono cercano, sin jerga técnica.",
      type: "array",
      of: [
        {
          type: "object",
          name: "para",
          title: "Párrafo",
          fields: [{ name: "text", title: "Texto", type: "localeText" }],
          preview: {
            select: { title: "text.es" },
            prepare: ({ title }) => ({
              title: title || "Párrafo",
            }),
          },
        },
      ],
    }),
    defineField({
      name: "pillarsTitle",
      title: "Título del bloque de principios",
      type: "localeString",
    }),
    defineField({
      name: "pillars",
      title: "Principios / cómo trabajo",
      description: "Tarjetas con tu forma de trabajar (a medida, IA con método…).",
      type: "array",
      of: [
        {
          type: "object",
          name: "pillar",
          title: "Principio",
          fields: [
            { name: "title", title: "Título", type: "localeString" },
            { name: "body", title: "Texto", type: "localeText" },
          ],
          preview: {
            select: { title: "title.es", subtitle: "body.es" },
          },
        },
      ],
      validation: (Rule) => Rule.max(4),
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
  preview: { prepare: () => ({ title: "Página Sobre mí" }) },
});
