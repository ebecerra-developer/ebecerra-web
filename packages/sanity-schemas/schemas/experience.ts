import { defineType, defineField } from "sanity";

export default defineType({
  name: "experience",
  title: "Experiencia",
  type: "document",
  fields: [
    defineField({ name: "company", title: "Empresa", type: "string" }),
    defineField({ name: "role", title: "Cargo", type: "localeString" }),
    defineField({ name: "period", title: "Periodo", type: "string" }),
    defineField({
      name: "tag",
      title: 'Etiqueta (ej: "actual")',
      type: "string",
    }),
    defineField({ name: "desc", title: "Descripción", type: "localeText" }),
    defineField({
      name: "tech",
      title: "Tecnologías / habilidades del puesto",
      type: "array",
      of: [{ type: "localeString" }],
    }),
    defineField({ name: "order", title: "Orden", type: "number" }),
  ],
  orderings: [
    { title: "Orden", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "role.es", subtitle: "company" },
  },
});
