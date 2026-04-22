# CLAUDE.md — ebecerra-web

## Contexto del proyecto

Portfolio personal de Enrique Becerra, Tech Architect Lead en VASS y especialista en Magnolia CMS.

**Estado actual (2026-04-22, post-Fase E):** rama `migracion-nextjs` es ya un **monorepo npm workspaces + Turborepo** con dos apps sobre un único Sanity compartido:

- **[`apps/es`](apps/es/)** → `ebecerra.es` — modo pro, escaparate comercial para captar clientes de desarrollo web (autónomos y PYMEs). **Home renderizada al 100%**: 8 secciones comerciales (Nav verde con logo blanco · Hero con monograma scale-deep + markup `[circle]...[/circle]` vía `AnnotatedText` · 3 Services con precios orientativos reales (1.500 € / 2.500 € / 500 €) y `priceNote` (render bajo `priceRange`) con framing Kit Digital (hasta 2.000 €) · 3 Casos anonimizados en grid (contexto/solución/resultado + "traducible a tu negocio") desde fallback poblado con `docs/cv-pro.md` · About con stats reales (8+ años, 13 proyectos, 6 AAPP) · Process timeline horizontal/vertical · Contact con form Resend funcional (sin GitHub en los datos) · Footer stone-900 warm). Sanity wireado para services/process/profile con fallback seguro; cases hoy se sirven del fallback estático. `/api/contact` con Resend listo (pendiente verificar dominio).
- **[`apps/tech`](apps/tech/)** → `ebecerra.tech` — modo geek, identidad técnica para comunidad, reclutadores y contactos LinkedIn. Next.js completo con la estética geek CV-style (8 secciones: Nav · Hero · About · Experience · Skills · Projects · Contact · Footer), idéntico al que teníamos pre-split.

La rama `main` sigue desplegando el SPA React 19 + Vite original en `ebecerra.es` — producción cambia al monorepo cuando se haga el cutover.

El "toggle geek mode" del plan original se sustituye por dominio: cada URL entra en su modo por defecto.

**Archivo histórico:** tags `archive/nextjs-geek-pure` (estado Next.js pre-split, single-app, commit `ba17925`) y `archive/migracion-nextjs-mixed` (estado con Fase B de mix geek+pro, commit `3763044`) permiten rollback si hace falta.

**Pendiente para producción** (no bloqueante en dev):
- Copiar `apps/tech/.env.local` → `apps/es/.env.local` (mismo `SANITY_REVALIDATE_SECRET`).
- Verificar dominio `ebecerra.es` en Resend, generar `RESEND_API_KEY`, setear `CONTACT_TO_EMAIL` (+ opcional `CONTACT_FROM_EMAIL`).
- Crear segundo proyecto Vercel apuntando a `apps/es` (Root Directory) con sus env vars.
- Cutover de DNS cuando se quiera publicar.

Plan completo y roadmap: [`docs/plan-migracion-nextjs-sanity.md`](docs/plan-migracion-nextjs-sanity.md).
Progreso de ejecución: [`docs/progress.md`](docs/progress.md).

## Stack

**Monorepo (`migracion-nextjs`):**
- **Root:** npm workspaces + Turborepo 2.x. `packageManager: "npm@10.4.0"`.
- **apps/es** y **apps/tech:** Next.js 16 + TypeScript + Tailwind v4 + next-intl 4. apps/tech tiene Sanity v5 integrado con queries CV-style. apps/es tiene Sanity v5 integrado con queries comerciales (`getFeaturedServices`, `getProcessSteps`, `getFeaturedCaseForHome`, `getProfileFeatures`) + Resend en `/api/contact`.
- **packages/sanity-schemas:** `@ebecerra/sanity-schemas` — tipos y schemas compartidos (experience, skill, techTag, project, profile, service, processStep, caseStudy, locale).
- **packages/sanity-client:** `@ebecerra/sanity-client` — cliente Sanity + queries GROQ + tipos TS compartidos.
- **packages/tokens:** `pro.css` y `geek.css` como CSS con custom properties (ver sección "Design tokens").

**Sanity project `gdtxcn4l`, dataset `production`** — único, compartido por ambas apps. Studio embebido en `apps/es/app/(misc)/studio/[[...tool]]`.

**Legacy en `main` (en producción hasta Fase 7):** React 19 + Vite 8 + JS vanilla + CSS co-located. Solo consultable. Detalles en el skill `/legacy-vite-codebase`.

**Destino (post-Fase 12):** mismo monorepo con packages adicionales (`ui`, `utils`), migración opcional de npm → pnpm workspaces (`packageManager` en root lo declara explícito), Resend para `/api/contact`, dos proyectos Vercel con `turbo-ignore` como Ignored Build Step apuntando al mismo repo con Root Directory distinto (`apps/es` y `apps/tech`).

## Comandos monorepo

Desde la raíz del repo:

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias de todos los workspaces (apps + packages). Enlaza packages como symlinks en `node_modules/@ebecerra/*`. |
| `npm run dev:es` | Arranca dev server de `apps/es` (pro). |
| `npm run dev:tech` | Arranca dev server de `apps/tech` (geek). |
| `npm run build` | Turborepo orquesta builds paralelos de ambas apps + sus packages. |
| `npm run lint` | Lint de todos los workspaces via Turborepo. |
| `npm run typecheck` | Typecheck de todos los workspaces via Turborepo. |

Desde dentro de una app específica: `npm run dev`, `npm run build`, etc. (scripts estándar de Next.js).

**Reglas al añadir dependencias:**
- Si es específica de una app → `npm install <pkg> -w @ebecerra/es` (o `@ebecerra/tech`).
- Si es compartida (tipo `zod`, `clsx`) → decidir si va en cada app o se extrae a un package.
- Dependencias de workspace: `"@ebecerra/sanity-client": "*"` en el `package.json` del consumidor.

## Convenciones de i18n (Fase 4 cerrada 2026-04-21, split monorepo 2026-04-22)

Sitio bilingüe **ES/EN** con `next-intl`. **Mismas convenciones en ambas apps** (`apps/es` y `apps/tech`) — los paths de ejemplo usan `apps/tech/...` como canonical, `apps/es` tiene la misma estructura. Detalles en el skill `/i18n-next-intl`.

**Routing:**
- ES sin prefijo en `/` (locale default).
- EN con prefijo en `/en`.
- `localePrefix: "as-needed"` definido en [`apps/tech/i18n/routing.ts`](apps/tech/i18n/routing.ts) y [`apps/es/i18n/routing.ts`](apps/es/i18n/routing.ts).
- Proxy en [`apps/tech/proxy.ts`](apps/tech/proxy.ts) (Next 16 renombró `middleware` → `proxy`) excluye `api`, `studio`, `playground`, `_next`, `_vercel`, `piezas-game`, `brand`, `.well-known` y archivos con extensión.

**Estructura `app/`:**
- `app/(locale)/[locale]/` — root layout con html/body + `NextIntlClientProvider`. Página home aquí.
- `app/(misc)/` — root layout con html/body `lang="es"` estático para rutas no-localizadas (`/studio`, `/playground/annotations`).
- `app/api/revalidate/route.ts` — route handler (sin layout).
- Favicons y `globals.css` en raíz de `app/`.
- **No existe `app/layout.tsx` ni `app/page.tsx`** — múltiples root layouts vía route groups.

**Textos UI:**
- Todos los strings en `apps/<app>/messages/es.json` y `apps/<app>/messages/en.json`.
- Namespaces dependen del app (cada una tiene sus propias secciones).
- Server components: `getTranslations("namespace")`. Client components: `useTranslations("namespace")`.
- **Añadir un string nuevo:** añadirlo a AMBOS archivos ES y EN del app correspondiente antes de usarlo. `next-intl` falla si falta una key.

**Contenido Sanity (packages compartidos):**
- Tipos `localeString` y `localeText` en [`packages/sanity-schemas/schemas/locale.ts`](packages/sanity-schemas/schemas/locale.ts) (object con `es` required + `en` opcional).
- Plugin `@sanity/language-filter` configurado en `apps/<app>/sanity.config.ts` — permite al editor filtrar por idioma en Studio.
- Queries GROQ proyectan con `coalesce(field[$locale], field.es, field)` — fallback automático a ES si no hay traducción. Ver [`packages/sanity-client/queries.ts`](packages/sanity-client/queries.ts).
- Fallback en `apps/<app>/lib/content.ts` con `getFallback(locale)` — cada app tiene su propio contenido fallback (tech es CV-style, es será commercial).
- **Añadir un campo traducible:** cambiar tipo a `localeString`/`localeText` en el schema del package → `npx sanity schema deploy` → migrar docs existentes (unset+set por vía MCP o similar).
- **Ambas apps importan** `@ebecerra/sanity-schemas` y `@ebecerra/sanity-client` — una sola fuente de verdad para schemas y queries.

**Selector de idioma:** botón ES/EN en `apps/<app>/components/sections/Nav.tsx` usando `useRouter`/`usePathname` de `apps/<app>/i18n/navigation.ts`. Cookie `NEXT_LOCALE` persiste la preferencia.

**SEO bilingüe:**
- `generateMetadata` dinámico por locale en `(locale)/[locale]/layout.tsx` de cada app.
- `alternates.languages` → hreflang automático en HTML.
- `apps/<app>/app/sitemap.ts` lista ambas URLs con alternates.
- `apps/<app>/app/robots.ts` excluye `/studio`, `/api`, `/playground`.

**Revalidación:** `apps/<app>/app/api/revalidate/route.ts` revalida `/` y `/en` en cada hit del webhook de Sanity.

## Permisos y autonomía

Autorización completa para:
- Crear, modificar y eliminar archivos en el proyecto.
- Instalar y desinstalar dependencias (`npm install`, `npm uninstall`).
- Hacer commits y push sin pedir confirmación previa (ver skill `/git-workflow`).
- Refactorizar dentro del alcance de la tarea.

## Identidad visual

**Logo y paleta cerrados (2026-04-19).**

- **Paleta modo pro:** stone warm neutrals + verde bosque `#047857` como único acento. Documentación en [`docs/design-tokens-pro.md`](docs/design-tokens-pro.md); CSS consumible desde código en [`packages/tokens/pro.css`](packages/tokens/pro.css). Se usa en `apps/es`.
- **Paleta modo geek (existente):** fondo `#080808`, verde neón `#00ff88`, azul `#00ccff`. CSS consumible en [`packages/tokens/geek.css`](packages/tokens/geek.css) con variables prefijadas `--geek-*` para coexistir con pro sin colisión. Base para `apps/tech`.
- **Logo:** monograma eB en 4 piezas con swoosh. Kit completo en `apps/<app>/public/brand/` (duplicado en ambas apps para que cada Next.js sirva los assets desde su propio `public/`).
- **Favicon:** solo la B verde (las 2 cachas) sobre transparente, en `apps/<app>/app/icon0.svg` (+ `.ico`, PNGs generados en `apps/<app>/app/` y `apps/<app>/public/brand/`). Ambas apps comparten el mismo favicon.
- **Backup app icons** (eB completo sobre verde) en [`docs/logo-exploration/app-icons-eB-backup/`](docs/logo-exploration/app-icons-eB-backup/) para cuando se empaquete como app móvil.

**Docs de referencia obligatoria antes de tocar marca:**
- [`docs/brand-logo.md`](docs/brand-logo.md) — reglas de uso, kit, pendientes.
- [`docs/logo-exploration/brand-manual.html`](docs/logo-exploration/brand-manual.html) — manual visual consultable.

## Design tokens — estructura y handoff

**`packages/tokens/`** es la fuente de verdad CSS para ambas identidades.

| Archivo | Identidad | Consumo |
|---|---|---|
| [`packages/tokens/pro.css`](packages/tokens/pro.css) | modo pro (`.es`) | variables sin prefijo: `--cta`, `--bg`, `--text`, `--fs-h1`, `--s-5`, etc. |
| [`packages/tokens/geek.css`](packages/tokens/geek.css) | modo geek (`.tech`) | variables con prefijo `--geek-*` |

**Integración por app:**
- **apps/es** → [`apps/es/app/globals.css`](apps/es/app/globals.css) importa `pro.css` (`@import "../../../packages/tokens/pro.css"`) y re-expone los tokens como utilities de Tailwind v4 vía bloque `@theme inline` (`--color-cta`, `--color-bg`, `--color-text-muted`, etc.). Permite usar clases `bg-cta`, `text-text-secondary`, `border-border-strong`, etc.
- **apps/tech** → [`apps/tech/app/globals.css`](apps/tech/app/globals.css) mantiene su paleta geek inline (valores literales `#080808`, `#00ff88`, etc.) tal cual estaba antes del split. No consume `packages/tokens/geek.css` aún — se integrará en Fase 5+ cuando se homogeneice con la estructura pro.

**Handoff de Claude Design:** [`docs/design-handoff-2026-04-22/`](docs/design-handoff-2026-04-22/) contiene el bundle exportado desde [claude.ai/design](https://claude.ai/design) tras la sesión de diseño del modo pro (home completa con las 8 secciones comerciales). Incluye:
- `project/index.html` — home como HTML/CSS/JS standalone (2178 líneas) con todos los tokens y la estructura final.
- `chats/chat1.md` — transcript de la conversación con Claude Design.
- `README.md` — instrucciones para agentes que implementan el diseño.

**Al implementar nuevos componentes pro** consulta primero `docs/design-handoff-2026-04-22/project/index.html` para ver el diseño de referencia validado. Es fuente de verdad visual por encima de cualquier otro mockup.

**rough-notation** ya está instalado (`rough-notation@0.5.1`, vanilla JS). Se usa para anotaciones hand-drawn en verde sobre palabras clave (hero, métricas, "8 años"). En React se envuelve con un pequeño hook cuando se implemente el Hero.

## Landing de Piezas — aislada

[`apps/es/public/piezas-game/`](apps/es/public/piezas-game/) es una **landing HTML estática independiente** servida en `ebecerra.es/piezas-game/` (dominio pro). Tráfico activo desde Play Store — **tocar con cuidado**. Solo existe en `apps/es` porque es tráfico comercial que debe vivir en el dominio `.es`.

Detalles (estructura, paleta propia, routing, reglas de edición): skill `/piezas-landing`.

## Lo que NO hacer sin preguntar

- Cambiar la estructura de carpetas raíz del workspace.
- Instalar librerías de UI grandes (MUI, Chakra, etc.) sin justificación.
- Refactorizar secciones no relacionadas con la tarea en curso.
- Modificar `@vercel/analytics` o `@vercel/speed-insights`.
- Tocar routing de `/piezas-game/*` sin validar en preview (ver `/piezas-landing`).
- Desviarse del stack destino definido en el roadmap sin consultarlo antes.

## Deployment y webhooks

**Revalidación ISR Sanity → web** (`/api/revalidate`) — configurado 2026-04-21. El mismo valor de `SANITY_REVALIDATE_SECRET` vive en:
  1. `apps/<app>/.env.local` (dev) — cada app tiene su propio fichero.
  2. Vercel (Production + Preview + Development) en ambos proyectos (ebecerra-es y ebecerra-tech).
  3. Webhook de Sanity Studio en [manage.sanity.io](https://manage.sanity.io) → proyecto `gdtxcn4l` → API → Webhooks, como `?secret=<valor>` en la URL `https://ebecerra.es/api/revalidate` (y opcionalmente también apuntando a `ebecerra.tech` cuando se deploye).
- Al llegar un POST válido, revalida `/` y `/en` (ver `apps/<app>/app/api/revalidate/route.ts`).
- Si se rota el secret, hay que actualizarlo en los 3 sitios a la vez (y ambas apps si ambas tienen webhook).

Formato de instrucciones completo en `apps/<app>/.env.local.example`.

## Configuración de correo - ebecerra.es

**Cuenta principal:**
- `e.becerra@ebecerra.es` — cuenta real, gestionada vía IMAP en Gmail.

**Aliases configurados en DonDominio** (todos redirigen a la cuenta principal):
- `contacto@ebecerra.es` — contacto general y formulario del portfolio.
- `info@ebecerra.es` — consultas formales.
- `legal@ebecerra.es` — avisos legales y privacidad.

**Notas:**
- DNS gestionados desde Vercel, no desde DonDominio.
- Registro MX pendiente de configurar en Vercel para activar el correo.
- `no-reply@ebecerra.es` no existe como alias, se usa solo como remitente en envíos automáticos de apps.

## Skills disponibles

Invocar con `/nombre-del-skill`. Todas instaladas en `.claude/skills/`.

### Skills propias del proyecto

| Skill | Cuándo usarla |
|-------|---------------|
| `/git-workflow` | Al hacer commits o push (workaround heredoc, convenciones de mensajes) |
| `/piezas-landing` | Al editar `public/piezas-game/` o el routing `/piezas-game/*` |
| `/legacy-vite-codebase` | Al consultar convenciones de la Vite legacy en `main` (o al portar detalles al modo geek de `apps/tech`) |
| `/i18n-next-intl` | Al añadir strings traducibles, crear páginas nuevas, modificar schemas Sanity bilingües o tocar routing por locale |

### Skills genéricas heredadas

| Skill | Uso |
|-------|-----|
| `/adapt` | Ajustes de responsive design |
| `/animate` | Microinteracciones y transiciones |
| `/audit` | Accesibilidad y rendimiento (Lighthouse) |
| `/simplify` | Revisar código cambiado por calidad y reuso |
| `/commit` | Crear commits con formato correcto |

### Skills para la migración a Next.js + Sanity

**Qué skill usar según la tarea:**

| Tarea | Skill |
|-------|-------|
| Diseñar o revisar layout, jerarquía visual y spacing de una sección | `/frontend-design` |
| Auditar UI/UX y coherencia visual de páginas completas | `/web-design-guidelines` |
| Generar paleta dual profesional/geek y tokens CSS | `/theme-factory` |
| Crear mockups rápidos o bocetos visuales antes de implementar | `/canvas-design` |
| Montar design system con Tailwind (tokens, utilidades, variantes) | `/tailwind-design-system` |
| Instalar, componer o personalizar componentes shadcn/ui | `/shadcn` |
| Escribir o revisar código Next.js App Router (RSC, Server Actions, routing) | `/next-best-practices` |
| Configurar caching, ISR, revalidación y streaming en Next.js | `/next-cache-components` |
| Aplicar patrones React 19 (Suspense, hooks nuevos, transiciones) | `/vercel-react-best-practices` |
| Tipar genéricos avanzados, utility types e inferencia en TS | `/typescript-advanced-types` |
| Diseñar schemas Sanity (tipos, referencias, validaciones, GROQ) | `/sanity-best-practices` |
| Modelar contenido: referenciar vs embeber, naming, i18n en Sanity | `/content-modeling-best-practices` |
| Optimizar contenido Sanity para SEO y AI Engine Optimization | `/seo-aeo-best-practices` |
| Auditar SEO on-page (metadata, hreflang, schema.org, Core Web Vitals) | `/seo-audit` |
| Redactar copy de servicios, casos de estudio y CTAs de conversión | `/content-strategy` |
| Integrar envío de emails transaccionales (formulario de contacto) | `/resend` |
| Configurar deploys, preview URLs, env vars y dominios en Vercel | `/deploy-to-vercel` |

**Reglas de uso:**
- Antes de empezar una fase del roadmap, revisar qué skills aplican.
- Si una tarea toca varias áreas, invocar en orden de dependencia (ej: `/theme-factory` → `/tailwind-design-system` → `/frontend-design`).
- Las skills de Sanity son críticas en Fase 3.
- Añadir más skills: `npx skills add <owner/repo@skill> -y` dentro del proyecto.
