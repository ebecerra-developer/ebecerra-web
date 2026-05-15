import { defineType, defineField } from "sanity";

export default defineType({
  name: "blogTag",
  title: "Tag (blog)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Slug en URL: /blog/tag/<slug>. Mismo slug en ES y EN.",
      type: "slug",
      options: {
        source: (doc) => (doc as { title?: { es?: string } }).title?.es ?? "",
        maxLength: 64,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      description: "Opcional. Aparece en la página del tag para SEO long-tail.",
      type: "localeText",
    }),
  ],
  preview: {
    select: { title: "title.es", subtitle: "slug.current" },
  },
});
