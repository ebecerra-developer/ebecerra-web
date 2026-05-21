import { defineType, defineField } from "sanity";

export default defineType({
  name: "chatbotBranding",
  title: "Branding del widget",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "primaryColor",
      title: "Color principal",
      description: "Hex, ej: '#047857'. Se usa para el botón flotante y elementos de acento.",
      type: "string",
      initialValue: "#047857",
      validation: (Rule) =>
        Rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { name: "hex color" }),
    }),
    defineField({
      name: "position",
      title: "Posición del botón",
      type: "string",
      options: {
        list: [
          { title: "Abajo a la derecha", value: "bottom-right" },
          { title: "Abajo a la izquierda", value: "bottom-left" },
        ],
        layout: "radio",
      },
      initialValue: "bottom-right",
    }),
    defineField({
      name: "bubbleLabel",
      title: "Etiqueta del botón flotante",
      description: "Texto que aparece sobre el círculo. Vacío = solo icono.",
      type: "localeString",
    }),
    defineField({
      name: "avatar",
      title: "Avatar (opcional)",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
