import { defineType, defineField } from "sanity";

export default defineType({
  name: "caseStudy",
  title: "Caso de estudio",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: (doc) => (doc.title as { es?: string })?.es ?? "" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "client",
      title: "Cliente",
      type: "string",
    }),
    defineField({
      name: "clientAnonymized",
      title: "Cliente anónimo (ocultar nombre real)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "year",
      title: "Año",
      type: "number",
    }),
    defineField({
      name: "summary",
      title: "Resumen (elevator pitch)",
      type: "localeText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "problem",
      title: "Problema",
      type: "localeText",
    }),
    defineField({
      name: "solution",
      title: "Solución",
      type: "localeText",
    }),
    defineField({
      name: "outcome",
      title: "Resultado",
      type: "localeText",
    }),
    defineField({
      name: "metrics",
      title: "Métricas",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Etiqueta", type: "localeString" },
            { name: "value", title: "Valor (ej: '+35%', '2.1s')", type: "string" },
          ],
          preview: { select: { title: "label.es", subtitle: "value" } },
        },
      ],
    }),
    defineField({
      name: "stack",
      title: "Stack",
      type: "array",
      of: [{ type: "reference", to: [{ type: "techTag" }] }],
    }),
    defineField({
      name: "cover",
      title: "Imagen de portada",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Texto alternativo", type: "localeString" },
      ],
    }),
    defineField({
      name: "images",
      title: "Galería",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Texto alternativo", type: "localeString" },
            { name: "caption", title: "Pie de foto", type: "localeString" },
          ],
        },
      ],
    }),
    defineField({
      name: "body",
      title: "Cuerpo (rich text)",
      type: "localePortableText",
    }),
    defineField({
      name: "featured",
      title: "Destacado en home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "order", title: "Orden", type: "number" }),
  ],
  orderings: [
    { title: "Año ↓", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
    { title: "Orden manual", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title.es", client: "client", year: "year" },
    prepare: ({ title, client, year }) => ({
      title,
      subtitle: [client, year].filter(Boolean).join(" · "),
    }),
  },
});
