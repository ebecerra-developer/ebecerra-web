import { defineType, defineField } from "sanity";

export default defineType({
  name: "examplesPage",
  title: "Página Ejemplos (meta)",
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
      type: "localeString",
    }),
    defineField({
      name: "kicker",
      title: "Kicker (/ejemplos)",
      type: "localeString",
    }),
    defineField({
      name: "title",
      title: "Título (/ejemplos)",
      type: "localeString",
    }),
    defineField({
      name: "lead",
      title: "Lead / subtítulo (/ejemplos)",
      type: "localeText",
    }),
    defineField({
      name: "ctaContact",
      title: "Texto CTA contacto",
      type: "localeString",
    }),
    defineField({
      name: "homeKicker",
      title: "Kicker (sección Home 05)",
      type: "localeString",
    }),
    defineField({
      name: "homeTitle",
      title: "Título (sección Home 05)",
      type: "localeString",
    }),
    defineField({
      name: "homeLead",
      title: "Lead (sección Home 05)",
      type: "localeText",
    }),
    defineField({
      name: "homeViewAll",
      title: "Texto botón 'Ver todos los ejemplos' (Home)",
      type: "localeString",
    }),
    defineField({
      name: "emptyState",
      title: "Mensaje estado vacío",
      description: "Cuando no hay demos publicadas.",
      type: "localeString",
    }),
  ],
  preview: { prepare: () => ({ title: "Página Ejemplos (meta)" }) },
});
