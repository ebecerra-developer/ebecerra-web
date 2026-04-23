import { defineType, defineField } from "sanity";

export default defineType({
  name: "profile",
  title: "Perfil",
  type: "document",
  groups: [
    { name: "identity", title: "Identidad" },
    { name: "about", title: "Sobre mí" },
    { name: "contact", title: "Contacto" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      description: "Ej: Enrique Becerra. Alimenta Person.name en JSON-LD.",
      type: "string",
      group: "identity",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "jobTitle",
      title: "Puesto",
      description:
        "Ej: Desarrollador web freelance para autónomos y PYMEs. Alimenta Person.jobTitle en JSON-LD.",
      type: "localeString",
      group: "identity",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio1",
      title: "Bio — párrafo 1",
      type: "localeText",
      group: "about",
    }),
    defineField({
      name: "bio2",
      title: "Bio — párrafo 2",
      type: "localeText",
      group: "about",
    }),
    defineField({
      name: "stats",
      title: "Stats (bloque About)",
      description: "Cifras que acompañan la bio. Ej: 8 · años de oficio.",
      type: "array",
      group: "about",
      of: [
        {
          name: "profileStat",
          type: "object",
          fields: [
            {
              name: "value",
              title: "Valor",
              description: "Ej: 8, 150+, 20.",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "label",
              title: "Etiqueta",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: { title: "value", subtitle: "label.es" },
          },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "aboutFeatures",
      title: "Características de About (existente)",
      type: "array",
      group: "about",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", type: "string", title: "Icono (emoji)" },
            { name: "label", type: "localeString", title: "Etiqueta" },
            { name: "desc", type: "localeString", title: "Descripción" },
          ],
          preview: {
            select: { title: "label.es", subtitle: "icon" },
          },
        },
      ],
    }),
    defineField({
      name: "contact",
      title: "Contacto",
      description:
        "Se mapea a Person.* en JSON-LD y alimenta la sección de contacto.",
      type: "object",
      group: "contact",
      fields: [
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          validation: (Rule) =>
            Rule.required().regex(
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              { name: "email", invert: false }
            ),
        }),
        defineField({
          name: "linkedinUrl",
          title: "LinkedIn URL",
          type: "url",
        }),
        defineField({
          name: "location",
          title: "Ubicación",
          description: "Ej: Madrid · España",
          type: "localeString",
        }),
        defineField({
          name: "responseTime",
          title: "Tiempo de respuesta",
          description: "Ej: 24 h laborables",
          type: "localeString",
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "name" },
    prepare: ({ title }) => ({ title: title ?? "Perfil" }),
  },
});
