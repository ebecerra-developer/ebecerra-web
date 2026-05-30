import { defineType, defineField, type FieldDefinition } from "sanity";

const baseSectionMetaFields = (): FieldDefinition[] => [
  defineField({
    name: "kicker",
    title: "Kicker (línea superior)",
    type: "localeString",
  }),
  defineField({
    name: "title",
    title: "Título",
    type: "localeString",
  }),
  defineField({
    name: "lead",
    title: "Subtítulo / intro",
    type: "localeText",
  }),
];

export const serviceSectionMeta = defineType({
  name: "serviceSectionMeta",
  title: "Sección Servicios (meta)",
  type: "document",
  fields: [
    ...baseSectionMetaFields(),
    defineField({
      name: "auditStrip",
      title: "Audit strip (banner bajo grid)",
      type: "object",
      fields: [
        defineField({
          name: "kicker",
          title: "Kicker",
          type: "localeString",
        }),
        defineField({
          name: "body",
          title: "Cuerpo",
          type: "localeText",
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Sección Servicios (meta)" }) },
});

export const processSectionMeta = defineType({
  name: "processSectionMeta",
  title: "Sección Proceso (meta)",
  type: "document",
  fields: baseSectionMetaFields(),
  preview: { prepare: () => ({ title: "Sección Proceso (meta)" }) },
});

export const casesSectionMeta = defineType({
  name: "casesSectionMeta",
  title: "Sección Casos (meta)",
  type: "document",
  fields: [
    ...baseSectionMetaFields(),
    defineField({
      name: "labels",
      title: "Etiquetas internas",
      description: "Labels que aparecen dentro de cada card de caso.",
      type: "object",
      fields: [
        defineField({
          name: "context",
          title: "Contexto",
          type: "localeString",
        }),
        defineField({
          name: "solution",
          title: "Solución",
          type: "localeString",
        }),
        defineField({
          name: "result",
          title: "Resultado",
          type: "localeString",
        }),
        defineField({
          name: "translates",
          title: "Traducible a tu negocio",
          type: "localeString",
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Sección Casos (meta)" }) },
});

export const contactSectionMeta = defineType({
  name: "contactSectionMeta",
  title: "Sección Contacto (meta)",
  type: "document",
  fields: [
    ...baseSectionMetaFields(),
    defineField({
      name: "labels",
      title: "Etiquetas internas",
      description: "Labels que aparecen en el bloque de info de contacto.",
      type: "object",
      fields: [
        defineField({
          name: "email",
          title: "Email",
          type: "localeString",
        }),
        defineField({
          name: "linkedin",
          title: "LinkedIn",
          type: "localeString",
        }),
        defineField({
          name: "location",
          title: "Ubicación",
          type: "localeString",
        }),
        defineField({
          name: "response",
          title: "Respuesta",
          type: "localeString",
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Sección Contacto (meta)" }) },
});
