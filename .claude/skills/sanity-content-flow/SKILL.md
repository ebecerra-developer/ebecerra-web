---
name: sanity-content-flow
description: Flujo operativo para crear, editar, publicar y consultar contenido en Sanity (project gdtxcn4l). Úsalo al añadir docs, modificar schemas, deployar schemas, patchear contenido vía MCP, o montar queries GROQ en el frontend.
---

# Sanity content flow — ebecerra-web

Stack Sanity v5 compartido por ambas apps. **Project `gdtxcn4l`, dataset `production`, workspace `ebecerra-web`**.

## Schemas y queries

- **Schemas:** [`packages/sanity-schemas/schemas/`](../../../packages/sanity-schemas/schemas/) — compartidos. Tipos bilingües `localeString` y `localeText` en [`locale.ts`](../../../packages/sanity-schemas/schemas/locale.ts).
- **Cliente y queries:** [`packages/sanity-client/`](../../../packages/sanity-client/) — `client.ts` (Sanity client) + `queries.ts` (funciones GROQ tipadas).
- **Studio embebido:** [`apps/es/app/(misc)/studio/[[...tool]]/`](../../../apps/es/app/(misc)/studio/). Config en [`apps/es/sanity.config.ts`](../../../apps/es/sanity.config.ts) con `basePath: "/studio"` (crítico — sin esto Sanity interpreta "studio" como tool name).

## Política: todo contenido editable nace en Sanity

**No añadir copy comercial nuevo solo en `messages/*.json` o hardcoded.** Si el editor querría poder cambiarlo sin redeploy, va a Sanity:

1. Schema en `packages/sanity-schemas/schemas/` (singleton o colección según aplique).
2. Registrar en `packages/sanity-schemas/schemas/index.ts` (schemaTypes + SINGLETON_TYPES si aplica) y en `apps/es/sanity.config.ts` (`LOCALIZED_DOCUMENT_TYPES` + entry en structure).
3. Tipo en `packages/sanity-client/types.ts`.
4. Query en `packages/sanity-client/queries.ts` con **`DEFAULT_X` rico** (copy actual como punto de partida) + merge campo a campo. Firma del query devuelve `X` (no `X | null`).
5. Componente lee del singleton (`getX(locale)`) sin caer a `t()` de messages.
6. Deploy: ver bloque "Schema deploy" abajo (requiere token "Deploy Studio (Token only)").
7. Seed script `apps/es/scripts/seed-faseN-YYYY-MM-DD.mjs` con `createOrReplace` (idempotente, `--commit`).

Solo lo técnico se queda en `messages/*.json`: a11y labels, errors, ICU plurals (pluralización dinámica), fallbacks muy específicos de form.

## Schema deploy — token "Deploy Studio (Token only)" (2026-05-30)

El comando `npx sanity schema deploy` requiere el grant `sanity.project/deployStudio`. **Ningún rol estándar (Editor, Viewer, Access Manager) lo tiene** — solo el rol específico **"Deploy Studio (Token only)"** que aparece al crear un token nuevo en `sanity.io/manage/project/gdtxcn4l/api/tokens`.

Guardado como `SANITY_DEPLOY_TOKEN` en `apps/es/.env.local` (NO va a Vercel — solo uso local). Workaround para inyectarlo en el CLI (Sanity exige específicamente la variable `SANITY_AUTH_TOKEN`):

```bash
cd apps/es
SANITY_AUTH_TOKEN=$(grep "^SANITY_DEPLOY_TOKEN=" .env.local | cut -d= -f2-) \
  npx sanity schema deploy --workspace ebecerra-web
```

## Patrón "DEFAULT_ rico + fallback campo a campo"

```ts
export const DEFAULT_X: X = {
  field1: "copy actual",
  // ... copy actual hardcoded como punto de partida
};

export async function getX(locale: Locale): Promise<X> {
  const raw = await runFetch<Partial<X> | null>(
    `*[_type == "x"][0] { "field1": ${loc("field1")}, ... }`,
    { locale }
  ).catch(() => null);

  const d = DEFAULT_X;
  if (!raw) return d;
  return { field1: raw.field1 ?? d.field1 /* uno a uno */ };
}
```

Ventajas: el componente recibe siempre `X`, la web no se rompe si Sanity está caído o el field vacío, permite migrar messages → Sanity sin tocar el componente.

## Singletons editoriales (apps/es, post-Fase 6)

| Singleton | Cubre |
|---|---|
| `heroSection` | Sección 00 — hero del home |
| `servicesPricing` + `serviceSectionMeta` | Sección 01 — Servicios |
| `profile` | Sobre mí: aboutKicker, aboutTitle, aboutViewProfileCta, bio1, bio2, stats, aboutFeatures, contact, chatbot, chatbotTech |
| `capabilitiesSection` | Sección 03 — items[] con icon/badge/featured/title/description/bullets[] + noteLabel/noteText |
| `processSectionMeta` | Sección 04 — kicker/title/lead |
| `examplesPage` | Sección 05 home + página /ejemplos completa |
| `contactSectionMeta` | Sección 06 — kicker/title/lead + labels (email/linkedin/location/response) |
| `contactFormStep` + `contactFormSettings` | Wizard de form editable (10 types de field, mensajes globales) |
| `siteSettings` | Nav (items[] + ctaLabel) + footer ampliado (navColumn/socialLinks/crossLinks/legalLinks/colTitles/copyrightTemplate) |
| `faqPage` | Página /faq completa |
| `blogPage` | Chrome del blog. Ver blog-system.md |
| `casesSectionMeta` | Sección Cases (legacy, no renderizada) — kicker/title/lead + labels |

**Tech (singletons paralelos prefijados `tech*`):** `techHomeSections`, `techSiteSettings`, `techContactFormStep`, `techContactFormSettings`.

**Demos:** `demosIndexPage`, `demosBannerSettings`.

## Política: listas como arrays, no campos nombrados

Si hay N items de la misma forma (trust badges, stats, social links, FAQ items), **un campo `array` en el schema y un `.map()` en React.** Nunca `metaExperience` / `metaResponse` / `metaQuality` paralelos — es deuda que se paga cuando quieres añadir/reordenar uno.

## Política: bilingüe desde el primer commit

Todo string nuevo se escribe **ES + EN a la vez**. En Sanity: tipo `localeString` o `localeText` (object con `es` required + `en` opcional; queries con `coalesce(field[$locale], field.es, field)` → fallback a ES si falta traducción).

## MCP de Sanity — operaciones frecuentes

Autenticación: la primera vez en una sesión, llama `mcp__sanity__authenticate` → URL OAuth → el usuario autoriza → tools quedan disponibles. Si la página de redirect da error de conexión (es normal), pegarle al `complete_authentication` la URL completa que vio el usuario.

Tools disponibles vía `mcp__sanity__*`. Las más usadas:

| Tool | Para qué |
|---|---|
| `get_schema` | Ver fields de un tipo antes de patchear |
| `query_documents` | GROQ con perspective `raw` / `published` / `drafts` |
| `get_document` | Fetch directo por ID (con o sin `drafts.` prefix) |
| `patch_document_from_json` | `set` / `unset` / `append` en un doc. Si apunta a published, crea draft |
| `create_documents_from_json` | Crear drafts nuevos con contenido JSON |
| `publish_documents` | Pasa drafts a published |
| `generate_image` | Crea imagen IA y la asigna al field. Async (1-3 min) |
| `transform_image` | Modifica una imagen ya subida con instrucción IA |
| `list_releases` | Releases activas en el dataset |

Al patchear, target sin `drafts.` prefix → se crea draft automáticamente. Publicar con `publish_documents` (el patch NO afecta producción hasta publicar). **El webhook de revalidación se dispara tras `publish_documents`.**

Siempre incluir `workspaceName: "ebecerra-web"` en las llamadas — sin esto el MCP busca workspace `default` y devuelve "Schema not found".

### Append a arrays de inline objects — gotcha

Los arrays con `of: [{ type: "object", fields: [...] }]` (sin `name` propio) requieren **`_type: "object"` explícito** al hacer `append`:

```json
{
  "path": "team",
  "items": [{
    "_type": "object",
    "_key": "t3",
    "name": "Marcos Valle",
    "role": { "_type": "localeString", "es": "...", "en": "..." }
  }]
}
```

Si te lo dejas, falla con `Array item is missing required "_type" field`. Aunque los items existentes no tengan `_type` en el JSON guardado, el validador del MCP lo exige al añadir.

### Imágenes IA con `generate_image`

Async — devuelve "Image generation started" inmediatamente, la imagen aparece en el draft en 1-3 min. Para portraits/team, prompts efectivos incluyen aspect ratio (`4:5 vertical`), estilo (`editorial photography, NOT corporate or stock-like`), color palette y bg context. En arrays auto-añade un nuevo item; en campos individuales se asigna directamente. Tras generar todas las imágenes, **siempre `publish_documents`** o quedan solo en draft.

**Aspect ratio no garantizado:** el modelo respeta el ratio del prompt solo aproximadamente. Si pides "vertical 4:5" puede salir 1376×768 (≈16:9). Si necesitas un ratio estricto para layout (hero editorial vertical, IG feed cuadrado), regenera o usa `transform_image`.

### Patches en arrays — selectores por `_key`

Para `set`/`unset` apuntando a un item de array, usa el `_key` del item, no campos derivados como `name`. `contact.social[name=="WhatsApp"].url` puede fallar con 400; `contact.social[_key=="soc2"].url` funciona. Si no tienes el `_key`, hazte una query previa: `*[_id == "..."][0].contact.social[]{_key, name}`.

Plugin `sanity-plugin-asset-source-unsplash` no soporta sanity v5 a fecha 2026-05 — usar Media Library nativa o `generate_image`.

## Gotchas conocidos

- **`patch` con `set` sobre string plano esperando object falla con 500.** Ej: si un field era `"hola"` y quieres pasarlo a `{es: "hola", en: "hi"}`, necesitas dos calls: `unset` primero, `set` después.
- **Conflicting target.include** si metes múltiples operaciones sobre el mismo path de array en una sola call. Solución: una llamada por operación, o mezclar `set`/`unset` en distintos arrays. Ej: `unset` de dos items distintos del mismo array → falla, repartir en dos calls. `unset` de un item + `set` de otro campo distinto → OK.
- **Resend SDK NO lanza excepciones.** Hay que chequear `{data, error}` explícito; no basta con try/catch.
- **`revalidate: 3600`** en páginas = ISR de 1h. Si algo no se ve, o es cache o el webhook no disparó.

## Generar imágenes con IA (`mcp__sanity__generate_image`)

Genera una imagen y la sube como asset a un campo de un doc. Calidad muy buena para fotografía de producto sobre fondo blanco / emblemas de logo flat.

- **Solo acepta un campo `image` simple o un ARRAY DE IMÁGENES.** Un array de OBJETOS (ej. `demoSite.lifestyleGallery` = `array of {image, alt}`) da `Invalid imagePath: … does not target an image field or array of images`. Para lotes usar un doc scratch con `caseStudy.images` (array de image); para 1-3 sueltas, un campo simple (`hero.image`, `thumbnail`).
- **Es asíncrono** ("uploaded shortly"). Tras llamar, hacer **polling** con GROQ: campo simple → `defined(hero.image.asset)` / `hero.image.asset->url`; array → `{"n": count(images), "last": images[-1].asset->url}` hasta que `n` sea el esperado y `last` no sea null. Suele tardar 5-20s.
- **Los assets NO se borran** al reasignar/borrar el campo → se puede reutilizar un campo simple sobreescribiéndolo y guardando cada URL antes de la siguiente; al final `discard_drafts` de los scratch (el asset queda vivo, la URL que guardaste sigue resolviendo).
- **Lotes grandes en paralelo:** N subagentes, cada uno con SU doc scratch (evita carreras al hacer append al array), generando en secuencia con barrera de orden (`count == i`), devolviendo `{handle: url}`. El principal escribe el mapa.
- **Recortar/redimensionar** en la URL del CDN: `?w=700&q=80&auto=format`; si salió apaisado y quieres cuadrado, `?w=200&h=200&fit=crop`.
- **Subir un asset propio (no IA)** — p.ej. un screenshot para thumbnail — via HTTP: `POST https://gdtxcn4l.api.sanity.io/v2021-06-07/assets/images/production?filename=x.png` con `Authorization: Bearer $SANITY_API_TOKEN` (de `apps/es/.env.local`) → devuelve `document._id` (`image-…`) para referenciar en un campo image.

## Webhook de revalidación

`SANITY_REVALIDATE_SECRET` vive en 3 sitios que hay que mantener sincronizados:

1. `apps/<app>/.env.local` (dev).
2. Vercel env vars (Production + Preview + Development) de cada proyecto.
3. Webhook en [manage.sanity.io](https://manage.sanity.io) → proyecto `gdtxcn4l` → API → Webhooks → URL `https://ebecerra.es/api/revalidate?secret=<valor>`.

**Patrón fan-out**: el plan free de Sanity solo permite 2 webhooks. El webhook de `apps/es` ya cubre el filtro completo de tipos (incluido `demoSite`). Cuando recibe un evento `_type == "demoSite"`, el handler en `apps/es/api/revalidate/route.ts` revalida `/ejemplos` Y reenvía el POST a `https://demos.ebecerra.es/api/revalidate?secret=...`. Así un único webhook Sanity cubre los 3 dominios. No crear webhooks adicionales para demos.

Cuando disparas `publish_documents`, Sanity hace POST al webhook → revalida `/` y `/en`.

Si rotas el secret, hay que actualizarlo en los 3 sitios a la vez.

## IDs actuales de docs frecuentes

| Tipo | ID | Nota |
|---|---|---|
| `servicesPricing` (singleton sección Servicios) | `148cf08a-bfe2-4188-ad31-79784ca11853` | Caminos × tiers + add-ons + cláusula + footnote. Fuente real de la sección Servicios desde 2026-05-17. |
| `profile` (singleton + chatbots) | `136f3077-4754-470c-9f79-663097a57568` | Contiene `chatbot.systemPrompt` (recepción ebecerra.es) y `chatbotTech.systemPrompt` (consola ebecerra.tech). |
| `service` web-presencia (legacy) | `17d4e524-2f39-4a35-8b1f-3ba705566f33` | Deprecated en home, sigue alimentando JSON-LD vía `StructuredData`. |
| `service` web-editable (legacy) | `5ab18da6-add5-48d6-a09a-ca96639ce62d` | Idem. |
| `service` rescate-web (legacy) | `84d16ea1-b1a2-4efa-a2b7-ff13c26e2b0e` | Idem. |
| `service` mantenimiento (legacy) | `8674893a-2479-4794-830d-9d0b7d6e3cb3` | Idem. |

Actualizar aquí cuando se creen o reenumeren docs.

## Buenas prácticas de schema

- **Un schema por concepto**, no sobrecargar un tipo con docenas de campos condicionales.
- **Singletons** para datos únicos (hero, siteSettings). Validar con `.max(1)` en structure o en `defineType`.
- **Colecciones** para datos repetibles (services, processSteps, faqItems, caseStudies).
- **Campos bilingües** siempre con `localeString`/`localeText`.
- **Referencias** sobre embedding cuando el item podría reusarse (ej. `service` referenciado desde múltiples `caseStudy`).
- **Validación en schema** con `Rule.required()`, `Rule.max(N)`, `Rule.min(N).max(M)` — el Studio no deja publicar si falla.

## Deploy de schemas

Tras modificar schemas en `packages/sanity-schemas/`:

```bash
cd apps/es
npx sanity schema deploy
```

Solo hace falta deployar desde una app (las dos usan el mismo workspace). Primera vez pedirá login interactivo.
