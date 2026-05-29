# Visual Editing — ebecerra-web (monorepo)

Sanity Presentation Tool habilitado en el Studio embebido (`apps/es`). El mismo Studio sirve a los tres fronts del monorepo (`apps/es`, `apps/tech`, `apps/demos`).

## Decisión arquitectónica

**Una sola Presentation tool**, con el origin por defecto en `ebecerra.es` y `defineLocations` devolviendo hrefs absolutos para `ebecerra.tech` y `demos.ebecerra.es` según docType. Cuando el editor navega entre fronts desde el iframe, el Studio reactiva Draft Mode contra el `/api/draft-mode/enable` del front nuevo.

| docType | Front destino |
|---|---|
| `heroSection`, `servicesPricing`, `serviceSectionMeta`, `processSectionMeta`, `casesSectionMeta`, `contactSectionMeta`, `siteSettings`, `profile`, `caseStudy`, `processStep`, `faqPage`, `faqItem`, `examplesPage`, `legalPage`, `post`, `author`, `blogCategory`, `blogTag` | `ebecerra.es` |
| `project`, `experience`, `skill`, `techTag` | `ebecerra.tech` |
| `demoSite` | `demos.ebecerra.es` |

Datos fluyen por `sanityFetch` (`defineLive`) en `packages/sanity-client/live.ts`. Las 38 funciones helper de `queries.ts` pasan internamente por un wrapper `runFetch` que llama a `sanityFetch` — los callsites en cada `page.tsx` no cambian.

`<SanityLive />` está montado en los root layouts de las 3 apps (siempre); `<VisualEditing />` y `<DisableDraftMode />` solo en Draft Mode.

## Archivos tocados

**Package compartido:**
- [packages/sanity-client/client.ts](../packages/sanity-client/client.ts) — `stega.studioUrl` añadido
- [packages/sanity-client/live.ts](../packages/sanity-client/live.ts) — `defineLive` (nuevo)
- [packages/sanity-client/token.ts](../packages/sanity-client/token.ts) — read token (nuevo)
- [packages/sanity-client/queries.ts](../packages/sanity-client/queries.ts) — wrapper `runFetch` + 37 callsites migrados
- [packages/sanity-client/index.ts](../packages/sanity-client/index.ts) — exporta `sanityFetch`, `SanityLive`

**apps/es:**
- [apps/es/sanity.config.ts](../apps/es/sanity.config.ts) — `presentationTool({ resolve, previewUrl })`
- [apps/es/lib/sanity/presentation.ts](../apps/es/lib/sanity/presentation.ts) — `defineLocations` (nuevo)
- [apps/es/app/api/draft-mode/enable/route.ts](../apps/es/app/api/draft-mode/enable/route.ts) (nuevo)
- [apps/es/app/api/draft-mode/disable/route.ts](../apps/es/app/api/draft-mode/disable/route.ts) (nuevo)
- [apps/es/components/DisableDraftMode.tsx](../apps/es/components/DisableDraftMode.tsx) (nuevo)
- [apps/es/app/(locale)/[locale]/layout.tsx](../apps/es/app/(locale)/[locale]/layout.tsx) — `<SanityLive />` + `<VisualEditing />` condicional

**apps/tech:** mismas rutas + DisableDraftMode + layout. **No** tiene Presentation config (vive solo en apps/es).

**apps/demos:** ídem que apps/tech.

## Pasos manuales pendientes

> Estos no los puede hacer Claude. Hazlos cuando estés listo para probar.

### 1. Sanity Manage (sanity.io/manage → proyecto `gdtxcn4l`)

- [ ] **CORS Origins → Add CORS origin** (con **Allow credentials** marcado):
  - `http://localhost:3000` (dev apps/es)
  - `http://localhost:3001` (dev apps/demos, si lo usas)
  - `http://localhost:3002` (dev apps/tech, si lo usas)
  - `https://ebecerra.es`
  - `https://ebecerra.tech`
  - `https://demos.ebecerra.es`
- [ ] **API → Tokens → Add API token**:
  - Name: `web-viewer`
  - Permissions: **Viewer**
  - Copiar el token

### 2. Vercel env vars

> Cuenta free → no hay Team Env Vars. Hay que añadirlos en cada proyecto Vercel manualmente.

**apps/es (proyecto `ebecerra-es`):**
- [ ] `SANITY_API_READ_TOKEN` = token Viewer creado arriba (Production + Preview + Development)

**apps/tech (proyecto `ebecerra-tech`):**
- [ ] `SANITY_API_READ_TOKEN` = mismo token (Production + Preview + Development)
- [ ] `NEXT_PUBLIC_SANITY_STUDIO_URL` = `https://ebecerra.es/studio`

**apps/demos (proyecto `ebecerra-demos`):**
- [ ] `SANITY_API_READ_TOKEN` = mismo token (Production + Preview + Development)
- [ ] `NEXT_PUBLIC_SANITY_STUDIO_URL` = `https://ebecerra.es/studio`

**Local (`apps/es/.env.local`):**
- [ ] `SANITY_API_READ_TOKEN=...` (mismo token, ya tienes `SANITY_API_TOKEN` para write; este es distinto)

### 3. Verificación

```bash
npm run dev:es
# Abrir http://localhost:3000/studio
# 1. Click en el icono Presentation (ojo + pantalla) en la sidebar del Studio
# 2. Debería abrir el iframe con http://localhost:3000
# 3. Click en cualquier texto editorial (kicker, título, lead)
# 4. El Studio salta al campo correspondiente
# 5. Editar y ver el cambio en vivo en el iframe
```

## Gotchas conocidos

1. **Metadata sin stega.** Las queries usadas en `generateMetadata` y `generateStaticParams` pasan por `runFetch` → `sanityFetch`. Cuando Draft Mode no está activo (caso normal en build estático) no hay stega y el title/description salen limpios. Si en algún futuro generas metadata dentro de un contexto Draft Mode, hay que pasar `stega: false` explícito al `sanityFetch`. Hoy esto **no es un problema activo**.

2. **String comparisons en draft.** Si alguna sección compara strings desde Sanity (`if (align === 'center')`), envuélvela con `stegaClean(...)` de `next-sanity` antes de comparar. Hoy no se hace en ninguna parte del proyecto, pero queda como nota para nuevas features.

3. **Webhook revalidate convive con SanityLive.** El webhook actual sigue funcionando para revalidación tras publicar. `<SanityLive />` además abre una subscripción Live Content para actualizaciones en preview. Coexisten sin conflictos.

4. **Schema deploy obligatorio.** Si añades un docType nuevo al schema, recuerda añadirlo a `apps/es/lib/sanity/presentation.ts` con su `defineLocations` para que el editor pueda navegar a su preview desde el Studio.
