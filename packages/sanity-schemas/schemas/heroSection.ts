import { defineType, defineField } from "sanity";

export default defineType({
  name: "heroSection",
  title: "Hero (home)",
  type: "document",
  fields: [
    defineField({
      name: "kicker",
      title: "Kicker (línea superior)",
      description: "Ej: // Disponible para que trabajemos juntos",
      type: "localeString",
    }),
    defineField({
      name: "title",
      title: "Título",
      description:
        "Admite markup inline parseado por AnnotatedText: [circle], [underline], [box], [highlight], [strike-through], [crossed-off], [bracket]. Ej: Construyo webs [circle]a medida[/circle] para atraer clientes.",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lead",
      title: "Subtítulo",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ctaPrimary",
      title: "CTA primario (label)",
      description:
        "Solo el texto del botón. El href es fijo (#contacto). Si vacío, cae al fallback de messages.",
      type: "localeString",
    }),
    defineField({
      name: "ctaSecondary",
      title: "CTA secundario (label)",
      description:
        "Solo el texto del botón. El href es fijo (#servicios). Si vacío, cae al fallback de messages.",
      type: "localeString",
    }),
    defineField({
      name: "trustBadges",
      title: "Trust badges",
      description:
        "Lista de micro-claims bajo el hero (experiencia, respuesta, calidad, ubicación…). Reordenables.",
      type: "array",
      of: [{ type: "localeString" }],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "marqueeItems",
      title: "Cinta de valor (marquee)",
      description:
        "Frases cortas que desfilan en la cinta verde bajo el hero. Ej: Sin plantillas · Web que convierte · Código tuyo. Sin jerga.",
      type: "array",
      of: [{ type: "localeString" }],
      validation: (Rule) => Rule.max(12),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Hero" }),
  },
});
