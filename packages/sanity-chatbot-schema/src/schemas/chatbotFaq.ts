import { defineType, defineField } from "sanity";

export default defineType({
  name: "chatbotFaq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Pregunta",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Respuesta",
      type: "localeText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags (opcional)",
      description: "Etiquetas para agrupar. Ej: precios, horarios, primera-cita.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: {
      title: "question.es",
      subtitle: "answer.es",
    },
    prepare: ({ title, subtitle }) => ({
      title: title || "(sin pregunta)",
      subtitle: subtitle ? subtitle.slice(0, 80) : undefined,
    }),
  },
});
