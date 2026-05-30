import { defineType, defineField } from "sanity";

// Paso del wizard del formulario de contacto de ebecerra.tech.
// Mismo patrón que contactFormStep (ebecerra.es) pero scope tech.
export default defineType({
  name: "techContactFormStep",
  title: "Tech · Contacto · Paso",
  type: "document",
  fields: [
    defineField({
      name: "stepIndex",
      title: "Índice",
      type: "number",
      validation: (R) => R.required().min(1),
    }),
    defineField({ name: "title", title: "Título", type: "localeString" }),
    defineField({ name: "description", title: "Subtítulo", type: "localeString" }),
    defineField({
      name: "kind",
      title: "Tipo de paso",
      type: "string",
      options: {
        list: [{ title: "Campos", value: "fields" }],
        layout: "radio",
      },
      initialValue: "fields",
      validation: (R) => R.required(),
    }),
    defineField({ name: "note", title: "Intro / nota", type: "localeText" }),
    defineField({ name: "footnote", title: "Disclaimer", type: "localeText" }),
    defineField({
      name: "fields",
      title: "Campos",
      type: "array",
      hidden: ({ parent }) => parent?.kind !== "fields",
      of: [
        {
          type: "object",
          name: "techContactField",
          fields: [
            defineField({
              name: "key",
              title: "Clave",
              type: "string",
              validation: (R) =>
                R.required().regex(/^s[1-9][0-9]?_[a-z0-9_]+$/, {
                  name: "sN_snake_case",
                  invert: false,
                }),
            }),
            defineField({
              name: "type",
              title: "Tipo",
              type: "string",
              options: {
                list: [
                  { title: "Texto", value: "text" },
                  { title: "Textarea", value: "textarea" },
                  { title: "Email", value: "email" },
                  { title: "Teléfono", value: "tel" },
                  { title: "URL", value: "url" },
                  { title: "Fecha", value: "date" },
                  { title: "Número", value: "number" },
                  { title: "Select", value: "select" },
                  { title: "Multiselect", value: "multiselect" },
                  { title: "Cards", value: "cards" },
                ],
              },
              validation: (R) => R.required(),
            }),
            defineField({ name: "label", title: "Label", type: "localeString", validation: (R) => R.required() }),
            defineField({ name: "helper", title: "Ayuda", type: "localeString" }),
            defineField({ name: "placeholder", title: "Placeholder", type: "localeString" }),
            defineField({ name: "required", title: "¿Obligatorio?", type: "boolean", initialValue: false }),
            defineField({
              name: "columns",
              title: "Columnas",
              type: "number",
              options: { list: [1, 2, 3] },
              initialValue: 1,
            }),
            defineField({ name: "autoComplete", title: "autoComplete", type: "string" }),
            defineField({
              name: "inputMode",
              title: "inputMode",
              type: "string",
              options: { list: ["text", "email", "tel", "url", "numeric", "decimal", "search"] },
            }),
            defineField({
              name: "options",
              title: "Opciones",
              type: "array",
              hidden: ({ parent }) =>
                !["select", "multiselect", "cards"].includes(parent?.type || ""),
              of: [
                {
                  type: "object",
                  name: "techContactOption",
                  fields: [
                    defineField({ name: "value", title: "Valor", type: "localeString", validation: (R) => R.required() }),
                    defineField({ name: "code", title: "Código", type: "string" }),
                    defineField({ name: "sub", title: "Sublabel", type: "localeString" }),
                  ],
                  preview: {
                    select: { value: "value.es", code: "code" },
                    prepare: ({ value, code }) => ({ title: value || "(vacío)", subtitle: code }),
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { key: "key", label: "label.es", type: "type" },
            prepare: ({ key, label, type }) => ({
              title: label || key,
              subtitle: `${key} · ${type}`,
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title.es", stepIndex: "stepIndex" },
    prepare: ({ title, stepIndex }) => ({
      title: title || `(paso ${stepIndex})`,
      subtitle: `s${stepIndex}`,
    }),
  },
});
