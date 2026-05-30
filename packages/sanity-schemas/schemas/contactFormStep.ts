import { defineType, defineField } from "sanity";

/**
 * Paso del wizard del formulario de contacto de ebecerra.es.
 *
 * Hoy el form tiene 1 solo paso (kind: 'fields') con 3 campos (name,
 * email, message). La estructura admite N pasos para crecer sin tocar
 * código: añadir un paso de "objetivos" con cards, paso de presupuesto
 * con select, etc.
 *
 * Cada paso es un documento referenciado desde `contactFormSettings`.
 * Las keys siguen la regex `^s[1-N]_[a-z0-9_]+$` (estables, predecibles,
 * ordenables) — esa misma key viaja al API y al email final.
 */
export default defineType({
  name: "contactFormStep",
  title: "Contacto · Paso del wizard",
  type: "document",
  fields: [
    defineField({
      name: "stepIndex",
      title: "Índice (s1, s2…)",
      type: "number",
      description:
        "Solo para auditoría/orden interno. El orden real lo da el array `steps` del singleton.",
      validation: (R) => R.required().min(1),
    }),
    defineField({ name: "title", title: "Título", type: "localeString" }),
    defineField({
      name: "description",
      title: "Subtítulo",
      type: "localeString",
    }),
    defineField({
      name: "kind",
      title: "Tipo de paso",
      type: "string",
      options: {
        list: [{ title: "Campos (form normal)", value: "fields" }],
        layout: "radio",
      },
      initialValue: "fields",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "note",
      title: "Intro / nota",
      type: "localeText",
      description: "Opcional. Texto largo encima de los campos.",
    }),
    defineField({
      name: "footnote",
      title: "Disclaimer al pie",
      type: "localeText",
      description: "Opcional. Texto pequeño bajo los campos.",
    }),
    defineField({
      name: "fields",
      title: "Campos",
      type: "array",
      hidden: ({ parent }) => parent?.kind !== "fields",
      of: [
        {
          type: "object",
          name: "contactField",
          fields: [
            defineField({
              name: "key",
              title: "Clave técnica (key)",
              type: "string",
              description:
                "Identificador estable. Formato: s<N>_<snake_case>. Se usa en el API y en el email.",
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
                  { title: "Select (1)", value: "select" },
                  { title: "Multiselect (N chips)", value: "multiselect" },
                  { title: "Cards (1 con sub-label)", value: "cards" },
                ],
              },
              validation: (R) => R.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "localeString",
              validation: (R) => R.required(),
            }),
            defineField({ name: "helper", title: "Texto de ayuda", type: "localeString" }),
            defineField({ name: "placeholder", title: "Placeholder", type: "localeString" }),
            defineField({ name: "required", title: "¿Obligatorio?", type: "boolean", initialValue: false }),
            defineField({
              name: "columns",
              title: "Columnas en desktop",
              type: "number",
              options: { list: [1, 2, 3] },
              initialValue: 1,
              description:
                "Layout en desktop. Cards / multiselect / textarea siempre van full-width.",
            }),
            defineField({
              name: "autoComplete",
              title: "autoComplete (HTML)",
              type: "string",
              description:
                'Ej: "name", "email", "tel", "url", "address-level2", "organization". Vacío = off.',
            }),
            defineField({
              name: "inputMode",
              title: "inputMode (mobile)",
              type: "string",
              options: {
                list: ["text", "email", "tel", "url", "numeric", "decimal", "search"],
              },
              description:
                "Teclado en mobile. Solo aplica a tipos text/email/tel/url/number.",
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
                  name: "contactOption",
                  fields: [
                    defineField({
                      name: "value",
                      title: "Valor (visible)",
                      type: "localeString",
                      description:
                        "Texto que se muestra Y se guarda. Se usa como label visible y como dato del envío.",
                      validation: (R) => R.required(),
                    }),
                    defineField({
                      name: "code",
                      title: "Código interno (opcional)",
                      type: "string",
                      description:
                        'Solo si necesitas un código estable independiente del label. Ej: "tier-esencial". Si está vacío se usa el valor visible.',
                    }),
                    defineField({
                      name: "sub",
                      title: "Sublabel (solo cards)",
                      type: "localeString",
                      description: "Texto pequeño bajo el label, solo para type=cards.",
                    }),
                  ],
                  preview: {
                    select: { value: "value.es", code: "code" },
                    prepare: ({ value, code }) => ({
                      title: value || "(vacío)",
                      subtitle: code || undefined,
                    }),
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { key: "key", label: "label.es", type: "type", required: "required" },
            prepare: ({ key, label, type, required }) => ({
              title: label || key,
              subtitle: `${key} · ${type}${required ? " · obligatorio" : ""}`,
            }),
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Por índice",
      name: "stepIndexAsc",
      by: [{ field: "stepIndex", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title.es", stepIndex: "stepIndex", kind: "kind" },
    prepare: ({ title, stepIndex, kind }) => ({
      title: title || `(paso ${stepIndex})`,
      subtitle: `s${stepIndex} · ${kind}`,
    }),
  },
});
