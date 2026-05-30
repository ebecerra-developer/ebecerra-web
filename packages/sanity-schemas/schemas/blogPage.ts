import { defineType, defineField } from "sanity";

// Singleton con todo el copy editorial del blog: listado, post detail,
// share/TOC, comments form. Los ICU plurals (readingMinutes, commentsCount)
// se quedan en messages porque next-intl los necesita para pluralización.
export default defineType({
  name: "blogPage",
  title: "Página Blog (meta)",
  type: "document",
  groups: [
    { name: "meta", title: "SEO" },
    { name: "chrome", title: "Listado / chrome" },
    { name: "post", title: "Post detail" },
    { name: "comments", title: "Comentarios" },
  ],
  fields: [
    // ─── SEO ────────────────────────────────────────────────────────────
    defineField({ name: "metaTitle", title: "Meta title", type: "localeString", group: "meta" }),
    defineField({ name: "metaDescription", title: "Meta description", type: "localeString", group: "meta" }),

    // ─── Chrome del listado ─────────────────────────────────────────────
    defineField({ name: "kicker", title: "Kicker (listado)", type: "localeString", group: "chrome" }),
    defineField({ name: "title", title: "Título (listado)", type: "localeString", group: "chrome" }),
    defineField({ name: "lead", title: "Lead / subtítulo (listado)", type: "localeText", group: "chrome" }),
    defineField({ name: "empty", title: "Mensaje 'sin posts'", type: "localeString", group: "chrome" }),
    defineField({ name: "filterAll", title: "Filtro · 'Todas'", type: "localeString", group: "chrome" }),
    defineField({ name: "filterCategory", title: "Filtro · 'Categoría'", type: "localeString", group: "chrome" }),
    defineField({ name: "sortNewest", title: "Orden · 'Más recientes'", type: "localeString", group: "chrome" }),
    defineField({ name: "sortOldest", title: "Orden · 'Más antiguos'", type: "localeString", group: "chrome" }),

    // ─── Post detail ────────────────────────────────────────────────────
    defineField({ name: "backToList", title: "Volver al blog", type: "localeString", group: "post" }),
    defineField({ name: "byPrefix", title: "Prefijo autor ('por')", type: "localeString", group: "post" }),
    defineField({
      name: "byAuthor",
      title: "Por {name}",
      description: "Usa {name} como placeholder.",
      type: "localeString",
      group: "post",
    }),
    defineField({
      name: "publishedOn",
      title: "Publicado el {date}",
      description: "Usa {date} como placeholder.",
      type: "localeString",
      group: "post",
    }),
    defineField({
      name: "updatedOn",
      title: "Actualizado el {date}",
      description: "Usa {date} como placeholder.",
      type: "localeString",
      group: "post",
    }),
    defineField({ name: "tocLabel", title: "TOC · 'En este artículo'", type: "localeString", group: "post" }),
    defineField({ name: "shareLabel", title: "Compartir", type: "localeString", group: "post" }),
    defineField({ name: "relatedHeading", title: "Artículos relacionados", type: "localeString", group: "post" }),
    defineField({ name: "likeLabel", title: "Likes · 'Me ha gustado'", type: "localeString", group: "post" }),
    defineField({ name: "likeThanks", title: "Likes · '¡Gracias!'", type: "localeString", group: "post" }),

    // ─── Comentarios ────────────────────────────────────────────────────
    defineField({ name: "commentsHeading", title: "Encabezado 'Comentarios'", type: "localeString", group: "comments" }),
    defineField({ name: "commentsEmpty", title: "Mensaje 'sin comentarios'", type: "localeString", group: "comments" }),
    defineField({
      name: "commentForm",
      title: "Form de comentarios",
      type: "object",
      group: "comments",
      fields: [
        defineField({ name: "title", title: "Título 'Deja un comentario'", type: "localeString" }),
        defineField({ name: "name", title: "Label Nombre", type: "localeString" }),
        defineField({ name: "email", title: "Label Email", type: "localeString" }),
        defineField({ name: "emailHint", title: "Hint email '(opcional…)'", type: "localeString" }),
        defineField({ name: "body", title: "Label Comentario", type: "localeString" }),
        defineField({ name: "submit", title: "Botón Enviar", type: "localeString" }),
        defineField({ name: "submitting", title: "Botón 'Enviando…'", type: "localeString" }),
        defineField({ name: "success", title: "Mensaje éxito", type: "localeString" }),
        defineField({ name: "error", title: "Mensaje error", type: "localeString" }),
        defineField({ name: "privacy", title: "Aviso privacidad", type: "localeString" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Página Blog (meta)" }) },
});
