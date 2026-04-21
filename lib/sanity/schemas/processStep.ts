import { defineType, defineField } from "sanity";

export default defineType({
  name: "processStep",
  title: "Paso del proceso",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "localeText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icono (nombre lucide o emoji)",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Orden",
      type: "number",
      validation: (Rule) => Rule.required().integer().positive(),
    }),
  ],
  orderings: [
    { title: "Orden", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title.es", order: "order" },
    prepare: ({ title, order }) => ({
      title: `${order ?? "?"}. ${title ?? "(sin título)"}`,
    }),
  },
});
