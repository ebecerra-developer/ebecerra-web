import { defineType, defineField } from "sanity";

export default defineType({
  name: "author",
  title: "Autor (blog)",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "jobTitle",
      title: "Puesto / rol corto",
      description: "Ej: Tech Architect Lead · Magnolia specialist",
      type: "localeString",
    }),
    defineField({
      name: "bioShort",
      title: "Bio corta (pie de post)",
      description: "1-2 líneas. Aparece bajo cada post.",
      type: "localeText",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bioLong",
      title: "Bio larga",
      description: "Para página de autor (futuro) o JSON-LD ampliado.",
      type: "localeText",
    }),
    defineField({
      name: "social",
      title: "Redes",
      type: "object",
      fields: [
        defineField({ name: "linkedinUrl", title: "LinkedIn URL", type: "url" }),
        defineField({ name: "githubUrl", title: "GitHub URL", type: "url" }),
        defineField({ name: "twitterUrl", title: "Twitter/X URL", type: "url" }),
        defineField({ name: "instagramUrl", title: "Instagram URL", type: "url" }),
        defineField({ name: "websiteUrl", title: "Web personal", type: "url" }),
      ],
    }),
    defineField({
      name: "email",
      title: "Email (para JSON-LD)",
      description: "Opcional. Solo se usa en structured data, no se muestra.",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "jobTitle.es", media: "photo" },
  },
});
