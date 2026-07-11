import { defineType, defineField } from "sanity";

/**
 * Singleton: sección de reseñas de Google en la home de apps/es.
 *
 * Datos REALES pegados desde la ficha de Google Business (nombre, estrellas,
 * fecha relativa y texto de cada reseña). No se inventan reseñas. La sección
 * solo se renderiza si enabled = true y hay al menos una reseña.
 *
 * placeUrl = enlace directo a las reseñas de la ficha (para "ver todas en
 * Google" y dar salida a quien no se fíe).
 */
export default defineType({
  name: "googleReviews",
  title: "Reseñas de Google",
  type: "document",
  fields: [
    defineField({
      name: "enabled",
      title: "Mostrar la sección",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "kicker",
      title: "Kicker (línea superior)",
      type: "localeString",
    }),
    defineField({
      name: "title",
      title: "Título de la sección",
      type: "localeString",
    }),
    defineField({
      name: "lead",
      title: "Subtítulo / intro",
      type: "localeText",
    }),
    defineField({
      name: "ratingAverage",
      title: "Puntuación media (0–5)",
      type: "number",
      description: "La que aparece en tu ficha de Google. Ej: 5 o 4.9.",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "ratingCount",
      title: "Nº de reseñas",
      type: "number",
      description: "El total que muestra tu ficha de Google.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "placeUrl",
      title: "Enlace a tu ficha de Google (reseñas)",
      type: "url",
      description:
        "URL a las reseñas de tu ficha (Google Maps / Business). El botón 'Ver todas en Google' apunta aquí.",
    }),
    defineField({
      name: "reviews",
      title: "Reseñas (reales, pegadas de Google)",
      type: "array",
      of: [
        {
          type: "object",
          name: "googleReview",
          fields: [
            defineField({
              name: "author",
              title: "Nombre de quien reseña",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "rating",
              title: "Estrellas (1–5)",
              type: "number",
              initialValue: 5,
              validation: (Rule) => Rule.required().min(1).max(5),
            }),
            defineField({
              name: "relativeDate",
              title: "Fecha (como la muestra Google)",
              type: "string",
              description: "Ej: 'hace 2 meses'. Se copia tal cual de la ficha.",
            }),
            defineField({
              name: "text",
              title: "Texto de la reseña",
              type: "text",
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "author", subtitle: "text", rating: "rating" },
            prepare: ({ title, subtitle, rating }) => ({
              title: `${"★".repeat(rating || 0)} ${title || ""}`.trim(),
              subtitle,
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Reseñas de Google" }),
  },
});
