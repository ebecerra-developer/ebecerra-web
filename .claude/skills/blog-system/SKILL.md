---
name: blog-system
description: Sistema de blog en apps/es — schemas Sanity, queries, páginas, layout sticky ToC, Shiki, rough-notation, likes+comments en Supabase. Úsalo al editar /blog/*, modificar schemas post/author/blogCategory/blogTag, ajustar el layout del post detail, o tocar likes/comments.
---

# Blog system — apps/es

Vivo desde 2026-05-15. Detalles completos en memoria [project_blog_system].

## Routing

- `/blog` — listado con filtros (categoría dropdown + sort toggle).
- `/blog/[slug]` — post individual.
- `/blog/categoria/[slug]` — listado por categoría (SSG).
- `/blog/tag/[slug]` — listado por tag (SSG).
- `/blog/rss.xml` — feed RSS por locale.

## Schemas Sanity (packages/sanity-schemas/schemas/)

`post.ts`, `author.ts`, `blogCategory.ts`, `blogTag.ts`. Post bilingüe (`body` ES + `bodyEn` EN), Portable Text con marks custom `roughUnderline`/`roughCircle`, code block, callout, imagen.

## Queries (packages/sanity-client/queries.ts)

`getPosts`, `getPostBySlug`, `getPostSlugs`, `getRelatedPostsAuto`, `getCategories`, `getCategoryBySlug`, `getTags`, `getTagBySlug`, `getAuthorBySlug`. Reading time se calcula en JS desde `length(pt::text(body))`.

**Decisión 2026-05-15**: las queries NO filtran por `publishedAt <= now()`. Lo publicado en Sanity = lo que se ve. No tocar este filtro a no ser que se quiera reactivar el "scheduling" (publicar en futuro).

## Layout del post detail (importante)

Estructura del shell:

```
.postShell { max-width: calc(--container-max + 2*56px) }   ← MISMO que faq/home/ejemplos
  └ .postLayout { grid en >=1200px: minmax(0, 1fr) 220px gap 48 }
      ├ <article .postBody>          ← body 832px en desktop
      │   ├ <header />                ← cover y header VAN AQUÍ DENTRO
      │   ├ <div .postCover>
      │   ├ <PortableContent />
      │   └ ...resto
      └ <TableOfContents />          ← columna 220px sticky, oculto en <1200
```

**Total dentro del shell = 1100** (igual ancho de contenido que el resto de páginas).

**Nunca** poner el cover o el header sueltos como hermanos del `.postLayout` — quedarían a ancho completo del shell mientras el body se queda a 832, y se ve mal alineado. Siempre dentro del `<article>`.

## Componentes (apps/es/components/blog/)

- `PostCoverFallback` — gradiente + monograma eB SIN texto. Si añades algún texto aquí, será una duplicación visual con el body de la card.
- `TableOfContents` — sticky lateral en >=1200px, oculto en mobile/tablet. Top sticky = 152px (top bar 72 + sub-nav 58 + buffer 22).
- `RoughActivator` — client component que aplica rough-notation a `[data-rough]` en viewport. Solo se monta dentro del post detail con `data-blog-post` en el article.
- `PostJsonLd` — schema.org Article + Person inline en el head.

## Shiki (lib/highlight.ts)

Pre-procesa codeBlocks server-side en `[slug]/page.tsx` con `highlightCodeBlocks`. PortableContent lee `highlightedHtml` si existe. 0 JS en cliente para syntax highlighting.

## Likes y comments

Tablas en Supabase: `post_likes`, `post_likes_log`, `post_comments`. RLS:
- `post_likes` SELECT público. UPDATE solo desde server (secret key).
- `post_comments` SELECT público filtrado por `status='approved'`. INSERT público con status forzado pending. UPDATE/DELETE solo desde server.
- `post_likes_log` y `chatbot_messages` cerrados al cliente.

Endpoints:
- `/api/blog/like` POST — RPC atómico `increment_post_likes`, fingerprint cookie `eb_fp` anti-doble-like.
- `/api/blog/comment` POST — honeypot + ip_hash + email a admin vía Resend.

Client components: `PostLikes` (optimistic update), `CommentForm` (honeypot oculto + status idle/submitting/success/error).

## Anchos / layout

Si el post o el listado se ven más estrechos que el resto del sitio, casi seguro es el bug de width — ver memoria [feedback_width_consistency]. NO aplicar `max-width` y `padding-inline` al mismo elemento sin compensar con `calc(--container-max + 2*56px)`.

## Crear un post nuevo

Vía Studio (recomendado): editor sube `coverImage`, escribe body en Portable Text, asigna `category` y `tags`, define `publishedAt` (ahora o pasado — el filtro de futuro está desactivado), publica.

Vía MCP Sanity:
1. `create_documents_from_json` con `_type: "post"` + bilingual body. Slug = doc id source.
2. `publish_documents` con el ID.
3. Para generar cover IA: `mcp__sanity__generate_image` con `imagePath: "coverImage"` — async, llega al draft, requiere `publish_documents` después para que sea visible en producción.

## Pendiente

- Buscador unificado (FAQ + posts + demos) cuando haya 10+ posts. Plan: Fuse.js cliente con index built-in en build. Hueco reservado en el top nav.
- Newsletter: NO planificado.
