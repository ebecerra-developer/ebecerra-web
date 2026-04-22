# Migración ebecerra.es → Monorepo Next.js + Sanity CMS + dominio dual .es/.tech

## Context

La web original ([ebecerra.es](https://ebecerra.es)) era un SPA React 19 + Vite — CV single-page con estética dark/hacker, todo hardcoded en JSX, sin CMS/router/i18n. Las Fases 0–4 la han transformado ya en una Next.js 16 App Router + Sanity + Tailwind v4 + next-intl (ES/EN) sobre la rama `migracion-nextjs`.

**Pivot arquitectónico (2026-04-21).** A partir de Fase 5 la migración deja de ser una *app con toggle* y pasa a ser un **monorepo con dos apps y dos dominios**:

- **`ebecerra.es`** (modo pro) — escaparate comercial para captar clientes de desarrollo web (autónomos/PYMEs). Audiencia: no técnica. Contenido: servicios, casos de estudio, proceso, CTAs de conversión.
- **`ebecerra.tech`** (modo geek) — identidad técnica para comunidad, reclutadores y contactos LinkedIn del mundo arquitectura Magnolia/VASS. Audiencia: técnica. Contenido: terminal interactiva, CV extendido, stack deep-dives, posible blog técnico.
- Un único Sanity Studio alimenta ambas apps. Contenido compartido (bio, experiencia, skills) marcado con `sites: ['es', 'tech']`. Contenido exclusivo va por tipo de documento.
- El "toggle geek mode" del plan original se sustituye por la elección de dominio. Ganamos: SEO limpio por dominio, dos identidades editoriales distintas, y nada de FOUC/cookies cross-mode. Perdemos: el gesto UX "una web, dos caras" — compensado por enlaces cruzados explícitos en el footer.

El repo sigue siendo único (`ebecerra-web`) y se reestructura a monorepo con Turborepo + pnpm.

---

## 1. Fases completadas

Resumen (detalle en [`progress.md`](progress.md)):

- **Fase 0** — rama `migracion-nextjs`, baseline Lighthouse.
- **Fase 1** — scaffold Next.js 16 + Tailwind v4 + fonts + Vercel preview.
- **Fase 2** — port 1:1 de los 8 componentes con Tailwind; paridad visual con la web Vite original.
- **Fase 3** — Sanity v5 (project `gdtxcn4l`, dataset `production`), schemas mínimos, Studio embebido en `/studio`, 33 docs migrados, ISR + webhook.
- **Fase 4** — next-intl 4 con `localePrefix: "as-needed"` (ES en `/`, EN en `/en`), route groups `(locale)/(misc)`, `localeString`/`localeText` en Sanity + `@sanity/language-filter`, sitemap/robots/hreflang bilingües.
- **Fase 5 (parcial)** — diseño pro validado con Claude Design (bundle en `docs/design-handoff-2026-04-22/`), tokens consolidados en `packages/tokens/pro.css` y `geek.css`; diseño geek pendiente de iterar sobre `apps/tech`.
- **Fase 8 adelantada** — split a monorepo `apps/{es,tech}` + `packages/{tokens,sanity-schemas,sanity-client}` con npm workspaces + Turborepo (pnpm dejado para más tarde con un cambio de `packageManager`). Tags `archive/nextjs-geek-pure` y `archive/migracion-nextjs-mixed` como rollbacks.
- **Fase 6 (parcial)** — schemas comerciales (service/processStep/caseStudy) publicados en Sanity; home pro de `apps/es` completa con 8 secciones + 3 casos anonimizados desde cv-pro.md + precios Kit Digital publicados; pendiente páginas dedicadas `/servicios`, `/casos`, `/casos/[slug]` y `generateMetadata` por página desde Sanity.
- **Fase 11 (parcial, solo .es)** — `/api/contact` con Resend, Zod, honeypot e idempotency operativo en `apps/es`; pendiente verificar dominio en Resend y setear `RESEND_API_KEY` + `CONTACT_TO_EMAIL` en Vercel.

> **Nota sobre orden de fases.** El roadmap original asumía ejecución secuencial; la ejecución real ha solapado Fases 5 → 6 → 8 → 11 para poder iterar diseño y arquitectura en paralelo. La verdad día-a-día vive en [`progress.md`](progress.md); el roadmap debajo se mantiene como referencia arquitectónica (stack destino, reglas de corte, configuración Vercel), no como orden estricto.

---

## 2. Arquitectura destino (post-Fase 8)

### 2.1 Stack

- **Monorepo** — pnpm workspaces + Turborepo (cache de builds y `turbo-ignore` para Vercel Ignored Build Step).
- **Next.js 16** App Router en ambas apps (ya en uso).
- **TypeScript** estricto.
- **Tailwind CSS v4** con tokens compartidos desde `packages/tokens`.
- **Sanity v5** — un único project/dataset. Studio embebido en `apps/es/studio` (elegido sobre deploy aparte para conservar Visual Editing/Presentation same-origin).
- **next-intl 4** (ES/EN) en ambas apps.
- **Resend** para el form de contacto (elegido sobre Formspree por control server-side y tracking).
- `@vercel/analytics` + `@vercel/speed-insights` por app — métricas separadas por dominio.

### 2.2 Estructura del monorepo

```
ebecerra-web/                              ← repo único
├── apps/
│   ├── es/                                ← ebecerra.es (modo pro)
│   │   ├── app/
│   │   │   ├── (locale)/[locale]/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx               ← home pro
│   │   │   │   ├── servicios/page.tsx
│   │   │   │   ├── casos/page.tsx
│   │   │   │   ├── casos/[slug]/page.tsx
│   │   │   │   ├── sobre-mi/page.tsx
│   │   │   │   └── contacto/page.tsx
│   │   │   ├── (misc)/studio/[[...tool]]/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── contact/route.ts       ← Resend
│   │   │   │   └── revalidate/route.ts
│   │   │   ├── sitemap.ts, robots.ts, icon0.svg, manifest.json
│   │   │   └── not-found.tsx, error.tsx, global-error.tsx
│   │   ├── proxy.ts                       ← middleware i18n
│   │   ├── messages/es.json, messages/en.json
│   │   ├── i18n/routing.ts, request.ts, navigation.ts
│   │   ├── public/piezas-game/            ← SIN CAMBIOS, solo en .es
│   │   ├── public/.well-known/assetlinks.json
│   │   ├── public/brand/
│   │   ├── next.config.ts, tailwind.config.ts, tsconfig.json
│   │   └── package.json
│   │
│   └── tech/                              ← ebecerra.tech (modo geek)
│       ├── app/
│       │   ├── (locale)/[locale]/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx               ← home geek (terminal + CV)
│       │   │   ├── sobre-mi/page.tsx
│       │   │   ├── proyectos/page.tsx
│       │   │   ├── proyectos/[slug]/page.tsx
│       │   │   ├── blog/page.tsx          ← opcional
│       │   │   └── contacto/page.tsx
│       │   ├── api/revalidate/route.ts
│       │   └── sitemap.ts, robots.ts, error.tsx, not-found.tsx
│       ├── proxy.ts
│       ├── messages/, i18n/
│       ├── public/
│       ├── next.config.ts, tailwind.config.ts, tsconfig.json
│       └── package.json
│
├── packages/
│   ├── sanity-schemas/                    ← consumido por Studio embebido
│   │   ├── index.ts
│   │   ├── documents/                     ← siteConfig, profile, bio, experience, skill, techTag, project, caseStudy, service, processStep, post, contactInfo
│   │   ├── objects/                       ← localeString, localeText, localePortableText, sitesField
│   │   └── package.json
│   ├── sanity-client/                     ← client + queries + tipos generados
│   │   ├── index.ts, client.ts, queries.ts, image.ts
│   │   ├── types.generated.ts             ← sanity typegen output
│   │   └── package.json
│   ├── ui/                                ← primitivos compartidos (Button, Card, Section, Link cross-domain)
│   │   └── package.json
│   ├── tokens/                            ← design tokens CSS + Tailwind preset
│   │   ├── pro.css, geek.css, shared.css
│   │   ├── tailwind-preset.ts
│   │   └── package.json
│   └── utils/                             ← helpers compartidos (formato fechas, typed env, fetch wrappers)
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                           ← root: scripts turbo, devDependencies compartidas
├── docs/                                  ← plan, progress, design refs
└── .github/                               ← CI opcional
```

**Qué se queda exclusivo en `apps/es`:** `public/piezas-game/`, `/.well-known/assetlinks.json`, `/studio`, Formspree legacy (solo durante transición), `/servicios`, `/casos`. La landing de Piezas está vinculada al Play Store con tráfico activo — se queda en el dominio histórico (`ebecerra.es/piezas-game/`).

**Qué se queda exclusivo en `apps/tech`:** terminal interactiva del Hero original, easter eggs, CV técnico extendido, posible blog.

### 2.3 Schemas de Sanity

Tipos centralizados en `packages/sanity-schemas/`. Consumidos por el Studio embebido (`apps/es/studio`) vía import del workspace.

**Objetos base:**
- `localeString`, `localeText`, `localePortableText` — ya existentes (Fase 4).
- `sitesField` — objeto reutilizable `sites: ['es', 'tech']` multi-select con validación "al menos uno".

**Documentos:**

| Schema | Lleva `sites` | Notas |
|---|---|---|
| `siteConfig` (singleton × 2) | No (uno por sitio vía `site: 'es' \| 'tech'`) | Nav, footer, socials, SEO defaults, site-specific copy |
| `profile` (singleton) | Sí | Nombre, foto, rol. Compartido. |
| `bio` | Sí, con variantes | Campos: `bioShort` (shared), `bioLongCommercial` (filtrado a `.es`), `bioLongTechnical` (filtrado a `.tech`). Una sola instancia, el renderer elige el campo según app. |
| `experience` | Sí | Mismo CV, cada entry elige dónde aparece. Por defecto `['es', 'tech']`. |
| `skill`, `techTag` | Sí | Por defecto ambos. |
| `project` | Sí | Con `summaryCommercial` + `summaryTechnical` (ambos `localeText`) para contar el mismo proyecto distinto en cada mundo. |
| `caseStudy` | Implícito `.es` | Problema/solución/resultado/métricas/stack/body PortableText. |
| `service` | Implícito `.es` | Titular, slug, icon, summary, deliverables, priceRange. |
| `processStep` | Implícito `.es` | Orden, título, descripción, icono. |
| `post` | Implícito `.tech` | Blog técnico (opcional, incremental). |
| `contactInfo` (singleton) | Sí | Email, redes. |

**Criterio:** el campo `sites` solo se añade en documentos *realmente compartidos*. Los que por naturaleza son exclusivos (service, caseStudy, processStep → `.es`; post → `.tech`) se filtran por tipo de documento en las queries de cada app — evitamos ruido editorial.

**Studio structure:** navegación lateral agrupada por "Compartido / Solo .es / Solo .tech". Singletons via lógica custom en `structure.ts` (sin plugin externo — basta un helper de 15 líneas).

**TypeGen:** `sanity typegen generate` en postinstall del workspace → tipos TS consumibles desde las dos apps y `packages/sanity-client`.

### 2.4 Queries y filtrado por sitio

En `packages/sanity-client/queries.ts`, cada query recibe el `site` como parámetro y filtra con GROQ:

```groq
*[_type == "experience" && ($site in sites || !defined(sites))] | order(order asc) {
  ...
}
```

Cada app llama con su site fijo (`"es"` en `apps/es`, `"tech"` en `apps/tech`). El `!defined(sites)` cubre legacy hasta que el backfill se complete.

### 2.5 i18n y enlaces cruzados

Ambas apps replican la config i18n actual (routing `as-needed`, locales ES/EN). `packages/ui` expone un `<CrossDomainLink />` que:
- En `.es`, el link a "LinkedIn-style / perfil técnico" apunta a `ebecerra.tech`.
- En `.tech`, el link a "Servicios / contrátame" apunta a `ebecerra.es`.
- Preserva el locale actual (`/en` cruza a `/en` del otro dominio).

### 2.6 Manejo de errores (baked-in)

- `error.tsx` y `global-error.tsx` en cada app con UI fallback en ambos modos visuales.
- `not-found.tsx` con copy propio de cada dominio.
- Fallback `lib/content.ts` (ya existe en Fase 3/4) **se retira en Fase 7** una vez validado que Sanity sirve contenido completo en prod. Mantenerlo más tiempo es code debt.
- Fetches Sanity con `next: { revalidate }` + `try/catch` que loggea y devuelve placeholder vacío (no 500).
- `/api/contact` (Resend) con: validación Zod, rate limiting (Vercel Edge Config o upstash), idempotency key, reCAPTCHA/Turnstile, tracking de errores.
- `/api/revalidate` con verificación de secret + early return 401, try/catch alrededor del `revalidatePath`.
- CORS Sanity: añadir `https://ebecerra.es`, `https://www.ebecerra.es`, `https://ebecerra.tech`, `https://www.ebecerra.tech` al whitelist.
- Env vars tipadas con Zod o `@t3-oss/env-nextjs` en cada app.

---

## 3. Roadmap (continúa desde Fase 4 cerrada)

**Principio rector:** la web debe seguir desplegable en cada fase. La producción pasa a Next.js *antes* del split (Fase 7) para validar la arquitectura nueva con tráfico real sin añadir la complejidad del monorepo encima. El split se hace después, en rama aparte, con preview.

### Fase 5 — Diseño visual de ambos modos (6–10h)

**Objetivo:** bajar a mockups concretos la dualidad pro/geek antes de implementar nada más.

**Decisión de herramienta — recomendación:**
- **Exploración visual (wireframes, mockups, dirección estética, micro-interacciones):** usar **Claude web con Artifacts/Canvas** (o "Claude Design" si está ya disponible en tu cuenta). Mejor iteración visual, generación de imágenes y comparación lado a lado. Output: PNGs/HTML estáticos guardados en `docs/design/`.
- **Implementación (tokens Tailwind, componentes React, integración con el repo):** **Claude Code** con skills `/frontend-design`, `/tailwind-design-system`, `/shadcn`, `/web-design-guidelines`.

Dividir así evita que el código se mezcle con decisiones de dirección artística. Si no queda claro, arranca con Claude web; si en 1h no estás iterando en visual, cambia a Claude Code.

**Entregables:**
- Mockups home `.es` (pro): hero con propuesta de valor, servicios, casos destacados, CTAs.
- Mockups home `.tech` (geek evolucionado): terminal protagonista con estética más cuidada que la actual, integración con CV técnico, easter eggs.
- Mockups secundarios: `/servicios`, `/casos/[slug]`, y equivalentes `.tech`.
- Tokens finales pro + geek consolidados en `docs/design-tokens-pro.md` y `docs/design-tokens-geek.md` — serán la base de `packages/tokens` en Fase 8.
- Decisiones: tipografía dominante en cada modo, densidad, iconografía, sistema de ilustraciones/anotaciones (rough-notation ya decidido).

**Hito:** mockups aprobados, tokens consolidados, skills de implementación claras.

### Fase 6 — Secciones comerciales sobre app única (10–14h)

Aún no hay split. Trabajamos sobre `migracion-nextjs` (monoapp). La app se ve y siente ya como el futuro `.es`.

- Schemas `service`, `processStep`, `caseStudy` añadidos a `lib/sanity/schemas/` (se moverán a `packages/sanity-schemas` en Fase 8).
- Páginas `/servicios`, `/casos`, `/casos/[slug]`.
- Home: sección "Casos destacados" + CTAs de conversión.
- `generateMetadata` por página desde Sanity.
- Contenido real mínimo (al menos 1 caso publicado, 3–4 servicios).
- Retirar `lib/content.ts` si Sanity está sólido, o dejar como fallback controlado.
- **Aplicar diseño Fase 5** al home y secciones nuevas.
- Tests manuales: navegación completa, form Formspree sigue vivo, `/piezas-game/*`, i18n ES/EN.

**Hito:** la web tiene propuesta comercial completa en modo pro. Lista para producción.

### Fase 7 — Cutover parcial: merge a `main` y prod (2–3h)

Objetivo táctico: **producción ya corre Next.js antes de tocar el monorepo**. Así cualquier regresión del split se detecta contra un baseline Next.js estable, no contra la Vite vieja.

- Review final de `migracion-nextjs` vs `main`.
- Merge a `main` (PR + squash) → Vercel despliega producción.
- Verificar en `ebecerra.es`:
  - Home, `/en`, navegación completa.
  - `/piezas-game/`, `/piezas-game/privacidad.html`, `/piezas-game/terminos.html`, `/.well-known/assetlinks.json`.
  - `/studio` con auth.
  - Form de contacto.
  - Sitemap + robots.
  - Lighthouse ≥ 90 en Perf/A11y/Best Practices/SEO.
- Actualizar CORS Sanity con el dominio de producción (si difiere del preview).
- Monitorizar Analytics + Speed Insights 48h.
- **No** archivar el código Vite todavía — sigue en git history; rollback disponible vía `git revert` del merge si algo pinta feo.

**Hito:** `ebecerra.es` nueva en producción. Vite retirado.

### Fase 8 — Split a monorepo (8–12h)

Rama nueva `split-monorepo` desde `main` post-Fase 7.

1. **Setup workspace raíz:**
   - `pnpm-workspace.yaml` con `apps/*` y `packages/*`.
   - `turbo.json` con tasks `build`, `dev`, `lint`, `typecheck`, `test`, dependencias entre paquetes.
   - `package.json` raíz con scripts `dev`, `build` delegados a turbo.
   - Migrar `package.json` actual a `apps/es/package.json`.
2. **Mover árbol actual a `apps/es`:**
   - `git mv app/ apps/es/app/`, ídem `messages/`, `i18n/`, `proxy.ts`, `public/`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `next-env.d.ts`, `eslint.config.mjs`.
   - Ajustar paths relativos y `baseUrl`/`paths` en tsconfig.
3. **Extraer paquetes:**
   - `packages/sanity-schemas/` — mover `lib/sanity/schemas/` aquí. Studio embebido lo importa del workspace.
   - `packages/sanity-client/` — mover `lib/sanity/client.ts`, `queries.ts`, `image.ts`; añadir campo `site` a las queries compartidas.
   - `packages/ui/` — extraer primitivos reutilizables cuando emerjan.
   - `packages/tokens/` — consolidar los tokens de Fase 5 (pro + geek).
   - `packages/utils/` — helpers genéricos.
4. **Crear `apps/tech`:** copia de `apps/es` como punto de partida para garantizar que arranca. Eliminar: `public/piezas-game/`, `/studio`, `/servicios`, `/casos`, form Formspree. Añadir: placeholder hero.
5. **Verificación local:**
   - `pnpm install` en raíz.
   - `pnpm --filter @ebecerra/es dev` y `pnpm --filter @ebecerra/tech dev` en puertos distintos.
   - `pnpm turbo build` completo sin errores.
   - Cobertura funcional de `apps/es` idéntica a pre-split.
6. **Preview Vercel:** push de `split-monorepo` → dos preview URLs (una por proyecto, ver Fase 10).

**Hito:** monorepo verde en local y preview. `apps/es` no ha regresionado. `apps/tech` es un esqueleto "Hello, tech world".

### Fase 9 — Construir `apps/tech` (12–16h)

- Aplicar el diseño geek de Fase 5 a `apps/tech`.
- Hero con terminal interactiva portada (la del `Hero.jsx` original, ya en `apps/es` si quedó del Fase 2 — mover a `apps/tech`).
- CV técnico extendido (`/sobre-mi` con más detalle que en `.es`).
- `/proyectos` y `/proyectos/[slug]` con perspectiva técnica (stack, decisiones, enlaces).
- Easter eggs reactivados y pulidos.
- Scaffold de `/blog` si entra (opcional, se puede diferir).
- Queries filtradas con `site: 'tech'`.
- Enlaces cruzados a `.es` desde Nav/footer.
- Schema.org JSON-LD tipo `Person` con enfoque técnico.

**Hito:** `apps/tech` tiene identidad propia, no es un clon.

### Fase 10 — Vercel + DNS para ambos dominios (2–4h)

Ver detalle en §4. Resumen:

- **Proyecto Vercel 1** (existente): reconfigurar con Root Directory `apps/es`, Ignored Build Step `npx turbo-ignore @ebecerra/es`, dominios `ebecerra.es` + `www.ebecerra.es`.
- **Proyecto Vercel 2** (nuevo): mismo repo, Root Directory `apps/tech`, Ignored Build Step `npx turbo-ignore @ebecerra/tech`, dominios `ebecerra.tech` + `www.ebecerra.tech`.
- DNS de `ebecerra.tech` apuntado al nuevo proyecto (ya gestionado en Vercel).
- Env vars replicadas en ambos proyectos (Sanity project/dataset, revalidate secret, Resend key).
- CORS Sanity actualizado.

**Hito:** `ebecerra.tech` sirve `apps/tech`, `ebecerra.es` sirve `apps/es`, builds condicionados.

### Fase 11 — Form + SEO + pulido (6–8h)

- `/api/contact` con Resend en `apps/es` (reemplaza Formspree). Plantilla HTML + texto plano, idempotency, rate limit, validación.
- Resend opcional también en `apps/tech` (formato más conciso).
- OG images con `@vercel/og` dinámicas por caso de estudio y proyecto.
- Schema.org JSON-LD completo: Person + ProfessionalService + Article (posts) + CreativeWork (proyectos/casos).
- Sitemaps por dominio (cada app genera el suyo).
- `robots.ts` por app con reglas específicas.
- Auditoría Lighthouse en ambos dominios ≥ 90.
- Corregir regresiones detectadas.

**Hito:** Core Web Vitals verdes en producción simulada (preview).

### Fase 12 — Cutover final del monorepo (2–3h)

- Merge `split-monorepo` → `main`.
- Vercel despliega ambos proyectos en sus dominios.
- Validación final: ambos dominios, ambas locales, `/piezas-game/*`, ambos sitemaps, contact form real, Studio editable.
- Monitorizar 48h: analytics, speed insights, errores.
- Cerrar fase comunicando (LinkedIn pro/tech según corresponda).

**Hito:** dos dominios vivos, un repo, un CMS, un autor.

---

## 4. Configuración Vercel + DNS — pasos manuales

### 4.1 Estado actual

- Proyecto `ebecerra-web` en Vercel → deploys de `main` → `ebecerra.es` + `www.ebecerra.es`. Previews desde `migracion-nextjs`.
- `ebecerra.tech` comprado, **no asignado** todavía a ningún proyecto.
- Env vars en el proyecto existente: Sanity project ID, dataset, revalidate secret. Confirmar inventario actual antes de Fase 7.

### 4.2 Cambios en Fase 7 (merge a main, aún monoapp)

No tocar la estructura del proyecto Vercel. Al mergear:
- Sigue siendo un solo proyecto, un solo Root Directory raíz.
- Verificar: Build Command default (`npm run build`), Output Directory default (`.next`).
- Confirmar env vars actuales siguen válidas.
- CORS Sanity: añadir `https://ebecerra.es` y `https://www.ebecerra.es` si no estaban ya.

### 4.3 Cambios en Fase 10 (post-split)

**Proyecto 1 — reconfigurar el existente para `apps/es`:**

| Campo | Valor |
|---|---|
| Root Directory | `apps/es` |
| Framework Preset | Next.js (auto-detecta) |
| Build Command | `pnpm turbo run build --filter=@ebecerra/es` *(o default si Vercel detecta bien la versión con turbo)* |
| Install Command | `pnpm install` (raíz detectado por `pnpm-lock.yaml` + `pnpm-workspace.yaml`) |
| Output Directory | `apps/es/.next` (auto con Root Directory) |
| Node Version | Latest LTS |
| Ignored Build Step | `npx turbo-ignore @ebecerra/es` |
| Domains | `ebecerra.es`, `www.ebecerra.es` (ya asignados) |
| Production Branch | `main` |

**Proyecto 2 — nuevo para `apps/tech`:**

1. New Project en Vercel → Import Git Repository → seleccionar `ebecerra-web` (mismo repo que el otro proyecto).
2. Antes del primer deploy, configurar:

| Campo | Valor |
|---|---|
| Project Name | `ebecerra-web-tech` |
| Root Directory | `apps/tech` |
| Framework Preset | Next.js |
| Build Command | `pnpm turbo run build --filter=@ebecerra/tech` |
| Install Command | `pnpm install` |
| Ignored Build Step | `npx turbo-ignore @ebecerra/tech` |
| Production Branch | `main` |

3. Env vars (copiar del proyecto `es`): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`, `RESEND_API_KEY` (si aplica).
4. Settings → Domains → Add `ebecerra.tech` y `www.ebecerra.tech`.
   - Vercel detecta que el dominio está en la cuenta (ya gestionado por Vercel DNS) y lo asigna directamente.
   - Elegir `ebecerra.tech` como primario (o `www.ebecerra.tech` con redirect, según preferencia SEO — recomiendo apex).
5. Settings → General → Node Version: LTS.
6. Deploy.

**CORS Sanity:**
- En `sanity.io/manage` → proyecto `gdtxcn4l` → API → CORS Origins → añadir `https://ebecerra.tech` y `https://www.ebecerra.tech` con `Allow credentials`.

**Revalidación ISR:**
- Crear webhook en Sanity apuntando a `https://ebecerra.tech/api/revalidate` además del existente en `ebecerra.es`.
- Mismo secret `SANITY_REVALIDATE_SECRET` en ambos.

### 4.4 Checklist pre-Fase 10

- [ ] DNS de `ebecerra.tech` efectivamente en Vercel (confirmar en `sanity.io/manage` o panel Vercel).
- [ ] Backup del proyecto Vercel actual (export env vars a fichero local encriptado por si hay que rehacer).
- [ ] Validar `pnpm install` y `pnpm turbo build` en local antes de empujar a Vercel.

---

## 5. Decisiones técnicas clave (actualizadas)

1. **Un repo, no dos.** Monorepo con Turborepo. Justificación: contenido compartido al 60–70%, un único autor, minimiza cost de mantenimiento (un upgrade Next/Tailwind/deps = una vez).
2. **Sanity único compartido.** Un project, un dataset, un Studio. Campo `sites` multi-select en documentos realmente compartidos; documentos exclusivos se filtran por tipo.
3. **Studio embebido en `apps/es/studio`** (no deploy aparte). Conserva Presentation/Visual Editing same-origin. Si en el futuro hace falta, separar es un refactor menor.
4. **pnpm** sobre npm/yarn: mejor handling de workspaces, más rápido, Vercel lo detecta solo via `pnpm-lock.yaml`.
5. **Turborepo** sobre Nx: setup mínimo, `turbo-ignore` integrado con Vercel, caché remoto opcional.
6. **Next.js en ambas apps.** Mismo stack = mismo mental model, mismas skills, upgrades coordinados.
7. **Cutover en dos pasos** (Fase 7 → Fase 12): producción pasa a Next.js antes del split. Reduce blast radius.
8. **Resend** sobre Formspree para `/api/contact`: control server-side, templates, tracking, domain auth ya configurado en DNS.
9. **Toggle geek mode descartado.** Sustituido por dominio. El modo "no se cambia con un botón, se cambia con una URL".
10. **Fallback `lib/content.ts`** se retira en Fase 6 una vez Sanity demuestre estabilidad en prod tras Fase 7. Mantenerlo indefinidamente es code debt.

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Merge a main (Fase 7) rompe `ebecerra.es` | Preview verde antes de merge, Lighthouse verde, checklist manual exhaustivo, rollback vía `git revert` |
| Split (Fase 8) rompe `apps/es` | Rama aparte, preview Vercel del proyecto `es` con Root Directory `apps/es` apuntando a `split-monorepo`, comparación visual con prod pre-split |
| Landing de Piezas se cae en cualquier momento (Play Store traffic) | Checklist `/piezas-game/*` en cada preview de Fase 7, 8 y 12 |
| `ebecerra.tech` con contenido vacío/pobre daña marca técnica | No activar dominio en Vercel hasta Fase 9/10, previews en URL de Vercel |
| Build times por monorepo sin caché | `turbo-ignore` por proyecto; turbo caché remoto si hace falta (Vercel Remote Caching es gratis en el plan actual) |
| CORS Sanity olvidado en nuevo dominio | Checklist en Fase 10 |
| Env vars desincronizadas entre proyectos | Documentar en `.env.example` por app, sync manual en Fase 10, considerar Vercel Shared Env Groups |
| Resend send quota / deliverability | Auth SPF/DKIM ya en DNS; empezar con volumen bajo, monitorear bounces |

## 7. Verificación end-to-end

Tras cada fase:
- `pnpm turbo build` sin errores.
- Deploy preview Vercel (o ambas previews desde Fase 10).
- Checklist manual: home ambos dominios, navegación, `/piezas-game/`, `/piezas-game/privacidad.html`, `/piezas-game/terminos.html`, `/.well-known/assetlinks.json`.
- Lighthouse ≥ 90 en Performance/A11y/SEO en ambos dominios.
- Desde Fase 6: editar texto en Studio → visible tras revalidación.
- Desde Fase 4 (ya cumple): `/es` y `/en` con contenidos distintos; `hreflang`.
- Desde Fase 10: ambos dominios responden con su SSL, sus sitemaps, sus robots.

---

## Resumen de horas (post-Fase 4)

| Fase | Horas | Acumulado |
|---|---|---|
| 5. Diseño visual | 6–10 | 6–10 |
| 6. Secciones comerciales | 10–14 | 16–24 |
| 7. Cutover parcial a main | 2–3 | 18–27 |
| 8. Split a monorepo | 8–12 | 26–39 |
| 9. Construir apps/tech | 12–16 | 38–55 |
| 10. Vercel + DNS | 2–4 | 40–59 |
| 11. Form + SEO + pulido | 6–8 | 46–67 |
| 12. Cutover final | 2–3 | 48–70 |

**Total pendiente: 48–70h.** Puedes cortar en producción tras Fase 7 (web pro en `.es` completa, sin `.tech` todavía) o tras Fase 12 (dual domain vivo).
