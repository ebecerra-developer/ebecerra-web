import { defineType, defineField } from "sanity";

// Página índice de demos.ebecerra.es (singleton).
// Contenido editable de la home del wrapper que lista todas las demos.
export default defineType({
  name: "demosIndexPage",
  title: "Demos · Página índice",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "localeString" }),
    defineField({ name: "lead", title: "Lead", type: "localeText" }),
    defineField({
      name: "ctaBack",
      title: "CTA volver",
      description: "Ej: Volver a ebecerra.es",
      type: "localeString",
    }),
  ],
  preview: { prepare: () => ({ title: "Demos · Página índice" }) },
});
