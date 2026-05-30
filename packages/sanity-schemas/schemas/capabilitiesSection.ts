import { defineType, defineField } from "sanity";

// Sección 03 de la home: "Más que una web". Cuatro tarjetas (asistente IA,
// reservas, integraciones, datos) con icono, badge opcional, título,
// descripción y bullets. Más una nota final con label y texto.
export default defineType({
  name: "capabilitiesSection",
  title: "Sección · Capacidades (03)",
  type: "document",
  fields: [
    defineField({
      name: "kicker",
      title: "Kicker",
      description: "Ej: Más que una web",
      type: "localeString",
    }),
    defineField({
      name: "title",
      title: "Título",
      type: "localeString",
    }),
    defineField({
      name: "lead",
      title: "Lead / intro",
      type: "localeText",
    }),
    defineField({
      name: "items",
      title: "Tarjetas",
      description:
        "Cada tarjeta es una capacidad. El orden del array es el orden visual.",
      type: "array",
      of: [
        {
          name: "capability",
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icono (emoji)",
              type: "string",
              description: "Ej: 🤖, 📅, 🔌, 📊",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "badge",
              title: "Badge (opcional)",
              description: "Ej: Nuevo. Aparece arriba a la derecha de la tarjeta.",
              type: "localeString",
            }),
            defineField({
              name: "featured",
              title: "Destacada",
              description: "Resalta visualmente esta tarjeta.",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "title",
              title: "Título de la tarjeta",
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
              name: "bullets",
              title: "Bullets",
              description: "Lista de puntos breves bajo la descripción.",
              type: "array",
              of: [{ type: "localeString" }],
              validation: (Rule) => Rule.max(6),
            }),
          ],
          preview: {
            select: { title: "title.es", subtitle: "icon", media: "icon" },
            prepare: ({ title, subtitle }) => ({
              title: title ?? "Tarjeta",
              subtitle,
            }),
          },
        },
      ],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: "noteLabel",
      title: "Etiqueta de la nota",
      description: "Ej: Importante",
      type: "localeString",
    }),
    defineField({
      name: "noteText",
      title: "Texto de la nota",
      type: "localeText",
    }),
  ],
  preview: { prepare: () => ({ title: "Sección · Capacidades" }) },
});
