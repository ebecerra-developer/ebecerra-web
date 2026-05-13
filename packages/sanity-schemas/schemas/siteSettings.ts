import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Ajustes del sitio",
  type: "document",
  groups: [
    { name: "metadata", title: "Metadata / SEO" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({
      name: "metadata",
      title: "Metadata / SEO",
      type: "object",
      group: "metadata",
      fields: [
        defineField({
          name: "title",
          title: "Título por defecto",
          type: "localeString",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "titleTemplate",
          title: "Plantilla de título",
          description: "Ej: %s · eBecerra",
          type: "string",
        }),
        defineField({
          name: "description",
          title: "Meta description",
          type: "localeString",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "ogDescription",
          title: "Descripción OpenGraph",
          type: "localeString",
        }),
        defineField({
          name: "twitterDescription",
          title: "Descripción Twitter",
          type: "localeString",
        }),
        defineField({
          name: "keywords",
          title: "Keywords",
          description:
            "Keywords bilingües. Consumidor en generateMetadata proyecta por locale.",
          type: "array",
          of: [{ type: "localeString" }],
        }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      group: "footer",
      fields: [
        defineField({
          name: "tagline",
          title: "Tagline",
          type: "localeText",
        }),
        defineField({
          name: "availability",
          title: "Disponibilidad",
          description: "Ej: disponible para que trabajemos juntos",
          type: "localeString",
        }),
        defineField({
          name: "email",
          title: "Email de contacto",
          description:
            "Aparece como enlace en la columna 'Síguenos' del footer. Ej: contacto@ebecerra.es",
          type: "string",
        }),
        defineField({
          name: "socialLinks",
          title: "Enlaces sociales",
          description:
            "LinkedIn, Instagram, Facebook, Google Business, etc. Se renderizan en el footer y en sameAs de JSON-LD.",
          type: "array",
          of: [
            {
              name: "socialLink",
              type: "object",
              fields: [
                {
                  name: "name",
                  title: "Nombre (LinkedIn, Instagram, …)",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "url",
                  title: "URL",
                  type: "url",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "external",
                  title: "Abrir en nueva pestaña",
                  type: "boolean",
                  initialValue: true,
                },
              ],
              preview: {
                select: { title: "name", subtitle: "url" },
              },
            },
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Ajustes del sitio" }),
  },
});
