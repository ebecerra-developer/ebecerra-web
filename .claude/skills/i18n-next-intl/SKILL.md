---
name: i18n-next-intl
description: Convenciones y gotchas del stack i18n del proyecto (next-intl 4 + Sanity localeString/localeText + @sanity/language-filter). Úsalo al añadir strings traducibles, crear páginas nuevas, modificar schemas de Sanity con contenido bilingüe, o tocar el routing/metadata por locale.
---

# i18n — ebecerra-web

Stack: **next-intl 4.9** (UI) + **Sanity localeString/localeText** (contenido) + **@sanity/language-filter 5** (Studio UX).

Fase 4 cerrada el 2026-04-21. Ver `docs/progress.md` y la sección "Convenciones de i18n" en `CLAUDE.md`.

## Locales

- **ES** (default, sin prefijo: `/`, `/#contacto`)
- **EN** (con prefijo: `/en`, `/en#contact`)

Fuente única: [`i18n/routing.ts`](../../../i18n/routing.ts) — exporta `routing` y tipo `Locale`.

## Arquitectura app/

```
app/
  (locale)/[locale]/           # Root layout 1: html/body + NextIntlProvider
    layout.tsx                 # generateMetadata + generateStaticParams
    page.tsx                   # home
  (misc)/                      # Root layout 2: html/body lang="es" estático
    studio/[[...tool]]/
    playground/annotations/
  api/revalidate/route.ts      # route handler, sin layout
  sitemap.ts                   # ambas URLs con alternates
  robots.ts                    # excluye studio/api/playground
  globals.css, icon0.svg, favicon.ico, manifest.json
```

**No hay `app/layout.tsx` ni `app/page.tsx` raíz.** Múltiples root layouts vía route groups.

`proxy.ts` (antes `middleware.ts`, Next 16 lo renombró) monta `createMiddleware(routing)` con matcher que excluye `api`, `studio`, `playground`, `_next`, `_vercel`, `piezas-game`, `brand`, `.well-known` y archivos con extensión.

## Pattern: añadir un string UI

1. Añadir la key a **ambos** `messages/es.json` y `messages/en.json`. Si falta en uno, `next-intl` lanza error en build.
2. En el componente:
   - **Server Component**: `const t = await getTranslations("namespace");`
   - **Client Component**: `const t = useTranslations("namespace");`
3. Interpolación: `t("key", { var: value })`. Rich text: `t.rich("key", { strong: (c) => <strong>{c}</strong> })`.

## Política — qué va a messages vs qué va a Sanity (apps/es, actualizado 2026-05-30)

Tras la migración de las Fases 1–6, **el copy editorial NO vive en messages**. Solo lo técnico se queda en `messages/*.json`:

| Categoría | Dónde vive | Ejemplo |
|---|---|---|
| Copy editorial (kicker, title, lead, bullets, CTAs visibles, mensajes form) | Sanity (singleton del bloque) | `capabilitiesSection`, `blogPage`, `siteSettings.nav.items[]`, `contactFormSettings` |
| Labels técnicos a11y (menuOpen, menuClose, language, langEs, langEn, skipToContent) | `messages/*.json` | `nav.menuOpen`, `a11y.skipToContent` |
| Plurales ICU (pluralización dinámica) | `messages/*.json` (Sanity no los soporta nativo) | `blog.readingMinutes`, `blog.commentsCount` |
| Mensajes de error genéricos (404, 500) | `messages/*.json` | `errors.notFound.title` |
| Fallback de botones cuando el editor deja un campo vacío | DEFAULT_* en queries.ts (no en messages) | `DEFAULT_BLOG_PAGE.commentForm.submit` |

**Namespaces vivos en `apps/es/messages/*.json` (2026-05-30):**
- `metadata` — fallback de generateMetadata (Sanity también lo cubre vía `siteSettings.metadata`).
- `a11y` — `skipToContent`.
- `nav` — solo labels a11y (`menuOpen`, `menuClose`, `language`, `langEs`, `langEn`, `homeSections`).
- `case` — kicker + placeholder del componente legacy Case.tsx (no usado en home).
- `blog` — **solo** `readingMinutes` y `commentsCount` (ICU plurals).

**Regla práctica**: si el editor querría poder cambiarlo sin redeploy → Sanity. Si es a11y/error técnico/pluralización ICU → messages. Patrón `DEFAULT_* rico en queries.ts` + fallback campo a campo evita que la web se rompa si Sanity está caído o un campo vacío.

Los namespaces históricos `hero`, `about`, `services`, `capabilities`, `process`, `cases`, `contact`, `examples`, `faq`, `footer`, `blog.*editorial`, `commentForm.*` **ya no existen**. Si encuentras `t("blog.title")` o similar en un componente nuevo, es bug — debe leer del singleton correspondiente (ver tabla en blog-system.md, sanity-content-flow.md).

## Pattern: campo Sanity traducible

1. Cambiar el tipo en el schema:
   - `string` → `localeString`
   - `text` → `localeText`
2. Deploy: `npx sanity schema deploy` (usar CLI, no MCP `deploy_schema` — este está prohibido si hay Studio local).
3. Migrar docs existentes (ver "Gotchas de migración" abajo).
4. Queries: proyectar con triple coalesce:
   ```
   "field": coalesce(field[$locale], field.es, field)
   ```
   Pasar `$locale` en `client.fetch(query, { locale })`.
5. El fallback en `lib/content.ts` también debe existir en ambos idiomas dentro de `getFallback(locale)`.

### En Studio
El plugin `@sanity/language-filter` (configurado en `sanity.config.ts` con `filterField` que chequea `enclosingType.name.startsWith("locale")`) oculta los idiomas no seleccionados. El editor ve solo ES o solo EN según selector global.

## Pattern: página nueva con contenido traducible

```tsx
// app/(locale)/[locale]/nueva/page.tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);  // importante para RSC rendering
  const t = await getTranslations("miNamespace");
  return <h1>{t("title")}</h1>;
}
```

Al añadir la página, añadir entrada en `app/sitemap.ts` si debe indexarse.

## Selector de idioma

Implementado en `components/sections/Nav.tsx`. Usa `useRouter`/`usePathname` de [`i18n/navigation.ts`](../../../i18n/navigation.ts) (wrapper `createNavigation(routing)`), llamada dentro de `startTransition`. Cookie `NEXT_LOCALE` guarda la preferencia.

## Metadata y SEO

En `(locale)/[locale]/layout.tsx`, `generateMetadata` recibe `params.locale` y usa `getTranslations({locale, namespace: "metadata"})`. `alternates.languages` genera hreflang; Next emite `hrefLang` (camelCase) en JSX, que el navegador lee como `hreflang`.

## Gotchas — MCP de Sanity para migrar datos

1. **Type mismatch en set**: `patch_document_from_json` devuelve 500 "Internal Server Error" si intentas `set` un objeto sobre un campo que actualmente contiene un string plano.
   **Workaround**: dos calls separadas: primero `unset: ["field"]`, luego `set: [{path: "field", value: {...}}]`. No se puede combinar unset+set del mismo path en una sola call (da "Conflicting operation across targets").
2. **Conflictos en arrays**: múltiples operaciones sobre items distintos del mismo array en una sola call disparan "Conflicting target.include parameters: target includes more than one append (or mixed) operation for array field". **Workaround**: una call por item de array.
3. **workspaceName**: el default `"default"` no funciona si el Studio usa otro nombre. El de este proyecto es `"ebecerra-web"` (ver `sanity.config.ts`). Hay que pasarlo explícito.
4. **Patches crean drafts**: tras parchar, los cambios van a `drafts.*`. Hacer `publish_documents` con los `ids` originales (sin prefijo `drafts.`) para activarlos.

## Gotchas — next-intl v4 + Next 16

1. **`middleware.ts` deprecado en Next 16** → usar `proxy.ts` con el mismo export default. Misma API.
2. Con `localePrefix: "as-needed"`, `/` sirve el locale default sin redirect visible (el proxy hace rewrite interno a `/es`). Las rutas generadas son `/es` y `/en` como SSG.
3. `setRequestLocale(locale)` en cada layout/page asincrono para que RSC renderice con el locale correcto (evita "Unable to find next-intl locale because the middleware didn't run on this request").

## Gotcha — caché Turbopack desincronizado

**Síntoma:** 500 en todas las rutas localizadas con el error genérico `Error: Jest worker encountered 2 child process exceptions, exceeding retry limit` en el log del dev server (`.next/dev/logs/next-development.log`).

**Causa:** si el `next dev` estaba corriendo ANTES de mover ficheros en `app/` (route groups), renombrar `middleware.ts` → `proxy.ts`, o cambiar la forma de los docs de Sanity (string plano → `{es, en}`), Turbopack cachea paths viejos y/o respuestas GROQ con shape antiguo. Las child-process que renderizan páginas crashean al intentar usar el caché obsoleto.

**Fix:**
1. Matar el proceso `next dev` (Ctrl+C o `taskkill /PID <PID> /F` en Windows — el PID aparece en el mensaje "Another next dev server is already running").
2. `rm -rf .next`.
3. `npm run dev`.

El build en frío (`npm run build`) nunca se ve afectado — es exclusivamente del watcher/HMR.

## Verificación end-to-end

```bash
npm run build            # debe pasar sin errores TS
npm run dev              # dev server
curl -I http://localhost:3000/           # 200, lang="es" en HTML
curl -I http://localhost:3000/en         # 200, lang="en"
curl http://localhost:3000/sitemap.xml   # incluye ambas URLs
curl http://localhost:3000/robots.txt    # excluye /studio, /api, /playground
```

Checklist:
- `<html lang>` correcto en cada locale.
- hreflang `es`, `en`, `x-default` presentes en `<head>`.
- Contenido de Sanity renderiza en el idioma correcto (fallback a ES si EN vacío).
- `/studio`, `/api/revalidate`, `/playground/annotations`, `/piezas-game/` accesibles (fuera del proxy).
- Switcher ES/EN navega correctamente sin perder `?query` ni hash.

## Matriz de campos traducibles (schemas Sanity)

| Schema | Campo | Tipo |
|--------|-------|------|
| experience | role | localeString |
| experience | desc | localeText |
| skill | name | localeString |
| techTag | name | localeString |
| project | title | localeString |
| project | description | localeText |
| project | statusText | localeString |
| project | links[].text | localeString |
| profile | aboutFeatures[].label | localeString |
| profile | aboutFeatures[].desc | localeString |

No traducibles (se quedan como están): `company`, `period`, `tag`, `order`, `level`, `id` (slug), `label` (categorías), `tech[]`, `status`, `href`, `external`, `icon`.