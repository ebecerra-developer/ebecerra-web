import { defineType, defineField } from "sanity";

// Banner global de demos.ebecerra.es (singleton).
// Aparece en cabecera de cada demo: "Esta web es un ejemplo. No representa
// un negocio real." con label "Demo" y CTA opcional.
export default defineType({
  name: "demosBannerSettings",
  title: "Demos · Banner global",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      description: "Pequeña etiqueta a la izquierda. Ej: Demo.",
      type: "localeString",
    }),
    defineField({
      name: "text",
      title: "Texto",
      type: "localeString",
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA · Texto",
      type: "localeString",
    }),
    defineField({
      name: "ctaHref",
      title: "CTA · URL",
      description: "URL a la que apunta el botón del banner.",
      type: "url",
    }),
  ],
  preview: { prepare: () => ({ title: "Demos · Banner global" }) },
});
