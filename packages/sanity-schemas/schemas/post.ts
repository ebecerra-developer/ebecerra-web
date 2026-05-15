import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * Bloque de Portable Text usado en el body del post.
 *
 * Marks custom:
 *   - roughCircle  → en frontend, envuelve el span con rough-notation circle
 *   - roughUnderline → idem con rough-notation underline
 *   - link → estándar
 *   - strong, em, code → estándar
 *
 * Estilos: normal, h2, h3, blockquote
 * Lists: bullet, number
 *
 * Decorators custom no requieren markDefs (no llevan datos extra). Marcas con
 * datos (link) sí.
 */
const postBlock = defineArrayMember({
  type: "block",
  styles: [
    { title: "Normal", value: "normal" },
    { title: "H2", value: "h2" },
    { title: "H3", value: "h3" },
    { title: "Cita", value: "blockquote" },
  ],
  lists: [
    { title: "Bullet", value: "bullet" },
    { title: "Numerada", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "Negrita", value: "strong" },
      { title: "Cursiva", value: "em" },
      { title: "Código inline", value: "code" },
      { title: "Subrayado a mano", value: "roughUnderline" },
      { title: "Círculo a mano", value: "roughCircle" },
    ],
    annotations: [
      {
        name: "link",
        type: "object",
        title: "Enlace",
        fields: [
          {
            name: "href",
            title: "URL",
            type: "url",
            validation: (Rule) =>
              Rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
          },
        ],
      },
    ],
  },
});

const postImage = defineArrayMember({
  type: "image",
  options: { hotspot: true },
  fields: [
    { name: "alt", title: "Alt text", type: "string" },
    { name: "caption", title: "Pie de foto", type: "string" },
  ],
});

const postCode = defineArrayMember({
  name: "codeBlock",
  title: "Bloque de código",
  type: "object",
  fields: [
    {
      name: "language",
      title: "Lenguaje",
      type: "string",
      options: {
        list: [
          { title: "Plain text", value: "text" },
          { title: "TypeScript", value: "ts" },
          { title: "JavaScript", value: "js" },
          { title: "TSX/JSX", value: "tsx" },
          { title: "Bash / shell", value: "bash" },
          { title: "JSON", value: "json" },
          { title: "HTML", value: "html" },
          { title: "CSS", value: "css" },
          { title: "SQL", value: "sql" },
          { title: "Python", value: "python" },
        ],
      },
      initialValue: "text",
    },
    {
      name: "code",
      title: "Código",
      type: "text",
      rows: 8,
    },
    {
      name: "filename",
      title: "Nombre de archivo (opcional)",
      type: "string",
    },
  ],
  preview: {
    select: { title: "filename", subtitle: "language" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Bloque de código",
      subtitle: subtitle ?? "text",
    }),
  },
});

const postCallout = defineArrayMember({
  name: "callout",
  title: "Aviso destacado",
  type: "object",
  fields: [
    {
      name: "tone",
      title: "Tono",
      type: "string",
      options: {
        list: [
          { title: "Info", value: "info" },
          { title: "Tip", value: "tip" },
          { title: "Warning", value: "warning" },
        ],
      },
      initialValue: "info",
    },
    { name: "body", title: "Cuerpo", type: "text", rows: 3 },
  ],
  preview: {
    select: { title: "tone", subtitle: "body" },
  },
});

export default defineType({
  name: "post",
  title: "Post (blog)",
  type: "document",
  groups: [
    { name: "main", title: "Contenido", default: true },
    { name: "taxonomy", title: "Taxonomía" },
    { name: "seo", title: "SEO / OG" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "localeString",
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "URL: /blog/<slug>. Mismo slug en ES y EN.",
      type: "slug",
      group: "main",
      options: {
        source: (doc) => (doc as { title?: { es?: string } }).title?.es ?? "",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Resumen",
      description:
        "1-2 líneas. Aparece en el listado y se usa como meta description si no defines una específica.",
      type: "localeText",
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      group: "main",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "updatedAt",
      title: "Última actualización",
      description: "Opcional. Si está, se muestra como dateModified en JSON-LD.",
      type: "datetime",
      group: "main",
    }),
    defineField({
      name: "coverImage",
      title: "Imagen de portada",
      type: "image",
      group: "main",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      group: "main",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Cuerpo (ES)",
      type: "array",
      group: "main",
      of: [postBlock, postImage, postCode, postCallout],
    }),
    defineField({
      name: "bodyEn",
      title: "Cuerpo (EN)",
      type: "array",
      group: "main",
      of: [postBlock, postImage, postCode, postCallout],
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "reference",
      group: "taxonomy",
      to: [{ type: "blogCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "taxonomy",
      of: [{ type: "reference", to: [{ type: "blogTag" }] }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "relatedPosts",
      title: "Posts relacionados (manual)",
      description:
        "Opcional. Si está vacío, se calculan por categoría/tags compartidos.",
      type: "array",
      group: "taxonomy",
      of: [{ type: "reference", to: [{ type: "post" }] }],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "seoTitle",
      title: "Meta title",
      description: "Override del title para SEO. Si vacío, usa title.",
      type: "localeString",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      description: "Override del meta description. Si vacío, usa excerpt.",
      type: "localeString",
      group: "seo",
    }),
    defineField({
      name: "ogImage",
      title: "OG image (override)",
      description:
        "Si vacío, se genera dinámicamente desde title + cover en /opengraph-image.",
      type: "image",
      group: "seo",
    }),
    defineField({
      name: "noindex",
      title: "Excluir de indexación",
      description: "Activar para drafts públicos o posts caducados.",
      type: "boolean",
      initialValue: false,
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Más recientes primero",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Más antiguos primero",
      name: "publishedAtAsc",
      by: [{ field: "publishedAt", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title.es",
      subtitle: "category.title.es",
      media: "coverImage",
    },
  },
});
