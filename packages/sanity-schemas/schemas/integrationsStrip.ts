import { defineType, defineField } from "sanity";

// Franja de "herramientas con las que trabajo / me integro" en la home de
// apps/es (entre Sobre mí y Capacidades). Señal de confianza para PYMEs:
// logos de herramientas que el cliente ya usa o reconoce (Google, WhatsApp,
// Stripe, Instagram, reservas…). Enfoque de COMPATIBILIDAD, no de partnership.
// Logos monocromos subidos como assets; el editor puede añadir/quitar.
export default defineType({
  name: "integrationsStrip",
  title: "Sección · Integraciones (franja de herramientas)",
  type: "document",
  fields: [
    defineField({
      name: "enabled",
      title: "Mostrar en la home",
      description: "Desactiva para ocultar la franja sin borrar el contenido.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "heading",
      title: "Título",
      description:
        'Encabezado de la franja. Ej: "Se conecta con las herramientas que ya usas".',
      type: "localeString",
    }),
    defineField({
      name: "items",
      title: "Herramientas",
      description: "Cada item es un logo. El orden del array es el orden visual.",
      type: "array",
      of: [
        {
          name: "integration",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Nombre",
              description: "Ej: Stripe, WhatsApp, Google. Se usa como alt y title.",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "logo",
              title: "Logo (SVG monocromo recomendado)",
              type: "image",
              options: { accept: "image/svg+xml,image/png" },
              fields: [{ name: "alt", title: "Texto alternativo", type: "string" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "Enlace (opcional)",
              type: "url",
            }),
          ],
          preview: {
            select: { title: "name", media: "logo" },
            prepare: ({ title, media }) => ({ title: title ?? "Herramienta", media }),
          },
        },
      ],
      validation: (Rule) => Rule.max(12),
    }),
  ],
  preview: { prepare: () => ({ title: "Sección · Integraciones" }) },
});
