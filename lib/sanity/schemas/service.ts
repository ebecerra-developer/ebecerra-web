import { defineType, defineField } from "sanity";

export default defineType({
  name: "service",
  title: "Servicio",
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
      name: "icon",
      title: "Icono (nombre lucide o emoji)",
      type: "string",
    }),
    defineField({
      name: "summary",
      title: "Resumen (tagline corto)",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción larga",
      type: "localeText",
    }),
    defineField({
      name: "deliverables",
      title: "Entregables",
      type: "array",
      of: [{ type: "localeString" }],
    }),
    defineField({
      name: "priceRange",
      title: "Rango de precio (ej: 'desde 800€')",
      type: "string",
    }),
    defineField({
      name: "priceNote",
      title: "Nota sobre el precio",
      type: "localeString",
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
    { title: "Orden", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title.es", subtitle: "priceRange" },
  },
});
