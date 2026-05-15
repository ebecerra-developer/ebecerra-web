import { defineType, defineField } from "sanity";

export default defineType({
  name: "blogCategory",
  title: "Categoría (blog)",
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
      description: "Slug en URL: /blog/categoria/<slug>. Mismo slug en ES y EN.",
      type: "slug",
      options: {
        source: (doc) => (doc as { title?: { es?: string } }).title?.es ?? "",
        maxLength: 64,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      description: "1-2 líneas. Se muestra en cabecera de la página de categoría + meta description.",
      type: "localeText",
    }),
    defineField({
      name: "order",
      title: "Orden",
      description: "Menor = aparece antes en filtros. Default 100.",
      type: "number",
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: "Orden manual",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title.es", subtitle: "slug.current" },
  },
});
