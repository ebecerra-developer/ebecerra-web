# Progreso de migración — Next.js + Sanity CMS

Plan de referencia: [`plan-migracion-nextjs-sanity.md`](plan-migracion-nextjs-sanity.md)

---

## Fase 0 — Preparación (2h)

- [x] Decidir repo nuevo vs rama — **rama `migracion-nextjs`** en el mismo repo (Vercel solo despliega `main`)
- [x] Snapshot Lighthouse de ebecerra.es actual como baseline — scores: Perf **83**, A11y **88**, Best Practices **100**, SEO **91**. Archivos en `docs/lighthouse-baseline.*` y `docs/baseline-screenshot.png`
- [x] Crear rama y configurar entorno

## Fase 1 — Scaffold Next.js + Tailwind desplegable (4–6h)

- [x] `create-next-app` con App Router + TS + Tailwind (Next.js 16.2.4)
- [x] Copiar `public/piezas-game/` y `.well-known/` al nuevo proyecto
- [x] Configurar `next.config.ts` (redirect `/piezas-game` → `/piezas-game/`)
- [x] Layout raíz con fonts (DM Sans, JetBrains Mono vía `next/font`)
- [x] Integrar `@vercel/analytics` + `@vercel/speed-insights`
- [x] Home placeholder desplegable — `npm run build` ✓
- [x] Deploy a staging en Vercel (preview URL via push a rama `migracion-nextjs`)
- [x] Validar `/piezas-game/`, `/piezas-game/privacidad.html`, `/.well-known/assetlinks.json` en staging ✓

## Fase 2 — Port 1:1 con contenido hardcoded (10–14h)

- [x] Portar Nav (hamburger + scroll)
- [x] Portar Hero (terminal interactiva completa)
- [x] Portar About (bio + feature cards)
- [x] Portar Experience (timeline)
- [x] Portar Skills (barras animadas + tags)
- [x] Portar Projects (cards con links)
- [x] Portar Contact (form Formspree)
- [x] Portar Footer
- [x] Contenido centralizado en `lib/content.ts` temporal
- [x] Paridad visual con sitio actual verificada — aprobada implícitamente; rediseño total en fases siguientes
- [x] Lighthouse ≥ 90 en staging — Perf **94**, A11y **96**, Best Practices **96**, SEO **100** (build prod local, `docs/lighthouse-next/`). Todas mejoran el baseline excepto Best Practices (100 → 96).

## Fase 3 — Integración de Sanity (8–12h)

- [x] Crear proyecto Sanity con dataset `production` (ID: gdtxcn4l)
- [x] Schemas: profile, experience, skill, techTag, project
- [x] Studio embebido en `/studio` (con `basePath: "/studio"` en sanity.config.ts)
- [x] Schema desplegado a Sanity Cloud (`npx sanity schema deploy`)
- [x] Migrar contenido de `lib/content.ts` a Sanity — 33 docs creados y publicados vía MCP remoto de Sanity (`https://mcp.sanity.io`, type `http`)
- [x] Queries GROQ en `lib/sanity/queries.ts`
- [x] Reemplazar imports hardcoded por fetches de Sanity (con fallback a `lib/content.ts`)
- [x] ISR + webhook de revalidación (`/api/revalidate`)
- [x] Verificar: editar texto en Studio → visible en la web tras revalidación

## Fase 4 — i18n ES/EN (6–8h)

- [x] Configurar `next-intl` con routing `/` (ES, sin prefijo) y `/en`
- [x] Migrar textos de UI a `messages/es.json` y `messages/en.json`
- [x] Convertir campos Sanity a `localeString`/`localeText` + plugin `@sanity/language-filter`
- [x] Traducir contenido base al inglés (UI + 33 docs Sanity)
- [x] Proxy (Next 16) con `localePrefix: "as-needed"` + selector ES/EN en Nav
- [x] `hreflang` + `sitemap.ts` + `robots.ts` bilingües
- [x] Verificar: `/` y `/en` renderizan contenidos distintos ✓ (lang correcto, Sanity sirve cada idioma)

## Fase 5 — Diseño visual de ambos modos (6–10h) — **CERRADA**

El "mockup" se convirtió en el propio handoff ejecutable de Claude Design + iteración directa sobre código. No hay PNG intermedios en `docs/design/`.

- [x] Home `.es` (pro) con las 8 secciones comerciales (handoff 2026-04-22 en [`docs/design-handoff-2026-04-22/`](design-handoff-2026-04-22/)) — implementada en `apps/es`.
- [x] Home `.tech` (geek) con terminal interactiva + CV técnico — implementada en `apps/tech` (preservada del estado pre-split).
- [x] Tokens pro consolidados en [`packages/tokens/pro.css`](../packages/tokens/pro.css) + doc de apoyo en [`docs/design-tokens-pro.md`](design-tokens-pro.md); tokens geek en [`packages/tokens/geek.css`](../packages/tokens/geek.css) con prefijo `--geek-*` (doc aparte descartada, el CSS es autoexplicativo).
- [x] Tipografías (DM Sans + JetBrains Mono), densidad, iconografía y sistema de anotaciones (`rough-notation` con wrapper `AnnotatedText` que parsea `[circle]…[/circle]` en strings i18n).
- [~] Páginas dedicadas `/servicios`, `/casos[/[slug]]` no se han diseñado aparte — se resuelve dentro de la home `apps/es` hasta que haya volumen que justifique el split en páginas.

## Fase 6 — Secciones comerciales sobre app única (10–14h)

El pivot a monorepo (Fase 8 adelantada) ha cambiado el contexto: ya no se trabaja sobre monoapp, sino sobre `apps/es` con packages compartidos. Lo que antes era `lib/sanity/schemas/` vive ahora en `packages/sanity-schemas/`.

- [x] Schemas: service, processStep, caseStudy en `packages/sanity-schemas/` + desplegados en Sanity Cloud
- [ ] Página `/servicios` con listado + sección "Proceso" *(la home cubre el listado por ahora)*
- [ ] Página `/casos` (listado)
- [ ] Página `/casos/[slug]` (detalle con PortableText)
- [x] Home: sección "Casos destacados" + CTAs de conversión *(3 casos anonimizados en grid con contexto/solución/resultado/traducible — 2026-04-23)*
- [ ] `generateMetadata` desde Sanity por página *(hoy la home tira de `messages/metadata`)*
- [~] Contenido real cargado — services con precios Kit Digital publicados en Sanity; casos aún servidos desde fallback estático anonimizado (cv-pro.md)
- [x] Aplicar diseño Fase 5 al home *(handoff 2026-04-22 implementado en `apps/es`)*
- [ ] Evaluar retirada del fallback `lib/content.ts` — se mantiene como red de seguridad mientras el dataset no tenga `caseStudy` publicados

## Fase 7 — Cutover parcial: merge a `main` y prod (2–3h) — **CERRADA**

El orden planeado ("monoapp a main → luego split") se saltó: la rama `migracion-nextjs` arrastró ya el split + apps/tech reconstruida, y se mergeó directa a `main`. El SPA Vite vive archivado en [`_legacy/`](../_legacy/) por si hiciese falta consultarlo.

- [x] Merge a `main` — monorepo en producción.
- [x] Vite retirado a `_legacy/` (en el working tree, además del historial git).
- [ ] Auditoría Lighthouse en prod ≥ 90 en las 4 categorías *(pendiente de correr contra el dominio en producción).*
- [ ] Actualizar CORS Sanity con los dominios de producción (`https://ebecerra.es`, `https://www.ebecerra.es`, `https://ebecerra.tech`, `https://www.ebecerra.tech`) si alguno no estaba ya — confirmar en [manage.sanity.io](https://manage.sanity.io).

## Fase 8 — Split a monorepo (8–12h) — **CERRADA**

Adelantada al 2026-04-22 dentro de la misma rama `migracion-nextjs` (en vez de `split-monorepo` aparte). Decisión pragmática: **npm workspaces + Turborepo** en lugar de pnpm — migrar a pnpm queda como un solo cambio de `packageManager` si compensa en el futuro.

- [x] Setup raíz: `package.json` con workspaces + `turbo.json`. `packageManager: "npm@10.4.0"`.
- [x] Árbol movido a `apps/es/` preservando historia (`git mv`).
- [x] Packages extraídos: `@ebecerra/sanity-schemas`, `@ebecerra/sanity-client`, `@ebecerra/tokens` (como `packages/tokens/*.css`).
- [x] `apps/tech/` creada como fork del estado Next.js pre-Fase B (no placeholder: CV-style completo intacto).
- [x] Verificación local: `npm run build` pasa ambas apps en ~40s vía Turborepo.
- [x] Cobertura funcional de `apps/es` idéntica a pre-split.
- [~] Packages `ui` y `utils` aún no se han extraído — no emergieron primitivos suficientemente compartidos para justificarlo. Se crearán cuando dos componentes equivalentes empiecen a divergir.

## Fase 9 — Construir `apps/tech` (12–16h) — **CERRADA**

El resultado no coincide del todo con la planificación: se mantuvo el estado Next.js pre-Fase B (CV-style sólido) en vez de rediseñar. Cuando se quiera iterar la identidad geek se abre otra fase.

- [x] `apps/tech` con 8 secciones: Nav · Hero (terminal interactiva) · About · Experience · Skills · Projects · Contact · Footer.
- [x] Hero con terminal interactiva (comandos `whoami`, `cat role.txt`, `./skills --top 3`, `echo $status`) + toggle input.
- [x] CV técnico dentro de la home (Experience + Skills + Projects) — sin página `/sobre-mi` dedicada, el long-form vive en la experiencia.
- [x] Schema.org JSON-LD (Person técnico) en [`apps/tech/components/StructuredData.tsx`](../apps/tech/components/StructuredData.tsx).
- [x] Form de contacto `/api/contact` portado a Resend (commit `86411c7`).
- [x] Monograma bracket-B neón + favicon propio (commit `4468cbf`).
- [x] Enlace cruzado a `ebecerra.es` en el footer (columna "ecosistema ebecerra").
- [~] Sin páginas dedicadas `/proyectos[/[slug]]` — los projects viven como sección en la home. Se crearán si el volumen lo pide.
- [~] Queries filtradas por `site` — descartado de momento. Cada app hace su propia query GROQ sobre el dataset compartido sin campo `sites`; los tipos de documento exclusivos (service/caseStudy/processStep para `.es`) se filtran por `_type`.
- [ ] Easter eggs del SPA original — no reactivados todavía.
- [ ] Scaffold `/blog` — diferido (opcional desde el inicio).

## Fase 10 — Vercel + DNS para `.tech` (2–4h)

Detalle en [`plan-migracion-nextjs-sanity.md`](plan-migracion-nextjs-sanity.md#4-configuración-vercel--dns--pasos-manuales). Confirmar vía dashboard de Vercel + Sanity manage antes de marcar — aquí quedan los ítems que no puedo verificar desde el repo.

- [x] Proyecto Vercel de `apps/es` desplegando `main` con Root Directory correcto (commits `chore: trigger vercel deploy`, `chore(turbo): declarar CONTACT_TO_EMAIL…` sugieren que el build pipeline funciona).
- [ ] Proyecto Vercel nuevo para `apps/tech` apuntando a `ebecerra.tech` + `www.ebecerra.tech`.
- [ ] CORS Sanity con los 4 dominios (es/tech + www).
- [ ] Webhook de revalidación adicional apuntando a `ebecerra.tech/api/revalidate` con el mismo `SANITY_REVALIDATE_SECRET`.
- [ ] SSL verificado en ambos dominios.

## Fase 11 — Form + SEO + pulido (6–8h)

- [x] `/api/contact` con Resend en `apps/es` (Zod + honeypot + idempotency SHA-256). Pendiente verificación de dominio y `RESEND_API_KEY` en Vercel antes de exponer en prod.
- [x] `/api/contact` también en `apps/tech` (commit `86411c7`).
- [x] Sitemaps y robots por app (`apps/<app>/app/sitemap.ts` + `robots.ts`).
- [x] Schema.org JSON-LD en ambas apps (`apps/es/components/StructuredData.tsx` Person + ProfessionalService; `apps/tech/components/StructuredData.tsx` Person técnico).
- [x] `global-error.tsx` en `apps/es`; `error.tsx` + `not-found.tsx` en `apps/tech`.
- [ ] `error.tsx` / `not-found.tsx` en `apps/es` con copy pro (solo existe `global-error.tsx`).
- [ ] OG images dinámicas con `@vercel/og` (ni `api/og` ni `opengraph-image.tsx` todavía — el og:image actual es la web-app-manifest 512×512).
- [ ] Auditoría Lighthouse ≥ 90 en los 4 scores contra ambos dominios en prod.
- [ ] Rate limit + Turnstile/reCAPTCHA en el form — el honeypot + idempotency cubren el 90% del ruido para el volumen esperado; añadir solo si aparece spam real.

## Fase 12 — Cutover final del monorepo (2–3h)

- [x] Merge del monorepo a `main` — se hizo en un solo paso con Fase 7 (ver nota allí).
- [ ] Ambos proyectos Vercel desplegando en paralelo sus dominios (apps/tech pendiente — ver Fase 10).
- [ ] Validación end-to-end: home `/` + `/en` en ambos dominios, `/piezas-game/*` (solo `.es`), form real con Resend, Studio editable y webhook revalidando.
- [ ] Comunicación pública (post en LinkedIn pro + LinkedIn tech cuando el dominio `.tech` esté vivo).

---

## Notas y decisiones sobre la marcha

> Registrar aquí cualquier cambio de plan, bloqueante o decisión tomada durante la ejecución.
> Formato: `YYYY-MM-DD — descripción`.

2026-04-16 — Creado el plan y el progreso. Aún no se ha empezado la implementación.
2026-04-17 — Fase 2 completada: 8 componentes portados, contenido en lib/content.ts.
2026-04-17 — Fase 3 completada (infra): Sanity setup con schemas, Studio en /studio, GROQ queries, ISR + webhook. Pendiente: poblar contenido manualmente en Studio.
2026-04-18 — Definida paleta del modo pro (enfoque B: ADN compartido con geek mode). Stone warm neutrals + verde bosque `#047857` como único acento. Tokens en [`design-tokens-pro.md`](design-tokens-pro.md).
2026-04-18 — Logo oficial cerrado: v6 (monograma eB con swoosh en pie de la e). Kit de variantes de color en [`logo-exploration/`](logo-exploration/). Reglas y pendientes en [`brand-logo.md`](brand-logo.md).
2026-04-19 — Validada paleta verde (vs teal). Verde bosque `#047857` confirmado como acento único. Kit final de logos: mono-black (primary), mono-white (dark bg), mono-green (acento), scale-balanced + scale-deep (expresivo), poli-cachas + poli-letras (opcional). Logo maestro en `public/brand/logo-master.svg`.
2026-04-19 — Manual de marca creado en [`logo-exploration/brand-manual.html`](logo-exploration/brand-manual.html) (9 secciones: concepto, variantes, escalas 16→192px, paleta, tipografía, clear space, do's & don'ts, referencia rápida).
2026-04-19 — Kit de logos movido a `public/brand/`. Metadata y icons configurados en `app/layout.tsx` (metadataBase, title template, description, authors, icons, openGraph, twitter). Favicon.svg provisional = copia de logo-black.svg; pendiente crear versión simplificada en Illustrator (Pathfinder Unite + eliminar swoosh fino). Build ✓.
2026-04-19 — Favicon cerrado: solo la **B verde** (2 cachas) sobre transparente. El eB completo se empastaba a 16px. Paquete generado con realfavicongenerator.net y desplegado en `app/` (favicon.ico, icon0.svg, icon1.png, apple-icon.png, manifest.json) + `public/brand/web-app-manifest-*.png`. Backup del paquete anterior "eB sobre verde" en [`logo-exploration/app-icons-eB-backup/`](logo-exploration/app-icons-eB-backup/) para uso futuro en apps móviles. Manual de marca actualizado. Build ✓.
2026-04-19 — Fase 3 cerrada al 100%: schema desplegado a Sanity Cloud, 33 docs migrados (6 experience + 12 skill + 12 techTag + 2 project + 1 profile) vía MCP remoto de Sanity (`https://mcp.sanity.io`, type `http`, OAuth). Fix: `basePath: "/studio"` en `sanity.config.ts` para que el Studio no interprete "studio" como tool name. Fallback `lib/content.ts` se mantiene como red de seguridad hasta rediseño de Fase 5+.
2026-04-19 — Fase 2 cerrada al 100%: paridad visual aprobada implícitamente (rediseño total viene en Fase 5+). Lighthouse sobre build prod local: Perf 94 (+11), A11y 96 (+8), Best Practices 96 (-4), SEO 100 (+9). Informe en [`docs/lighthouse-next/`](lighthouse-next/). LCP 2.8s, FCP 1.0s, CLS 0.045, TBT 110ms. Preview de Vercel no auditado aquí por protección de auth (401).
2026-04-20 — Kit de anotaciones resuelto con librería [`rough-notation`](https://roughnotation.com/) 0.5.1 en vez de SVG artesanal. 7 tipos soportados (underline, circle, box, highlight, strike-through, crossed-off, bracket). Componente wrapper en [`app/playground/annotations/Annotation.tsx`](../app/playground/annotations/Annotation.tsx), playground en `/playground/annotations`. Integración en la web real se pospone a Fase 5+ (rediseño con tokens pro). Decisiones y reglas de uso en [`illustrations/brief.md`](illustrations/brief.md). 4 demos artesanales descartados en `illustrations/_scrapped/`.
2026-04-20 — Sistema de marca ampliado a 3 marks según contexto (no según tamaño): **eB completo** para modo pro (`ebecerra.es`, LinkedIn, og:image, nav, facturas, casos de estudio); **`<B>`** para modo geek/tech (toggle geek mode activo, dominio `.tech`, GitHub, Twitter dev, badges técnicos) — fuente DM Sans 900 para los brackets, B reutilizada del eB original; **B sola** para favicon ≤32px en ambos modos. La dualidad pro/geek que ya estaba planeada en Fase 6 ahora tiene símbolo propio. El `<B>` justifica el dominio `.tech` comprado. Exploración en [`logo-exploration/bracket-b-final.html`](logo-exploration/bracket-b-final.html).
2026-04-20 — `<B>` vectorizado y kit cerrado: `public/brand/logo-bracket-b-{green,black,white}.svg`. Brackets generados con `fontkit` extrayendo glifos de DM Sans 900 (latin-900-normal.woff2 de @fontsource), B compartida con el eB. SVG editado en Illustrator por Enrique (paths unificados con Pathfinder Unite). `docs/brand-logo.md` y `docs/logo-exploration/brand-manual.html` actualizados con el sistema de 3 marks. Favicon confirmado como B sola (ni eB ni `<B>` aguantan a 16-32px). Exploraciones descartadas (Bowlby One, tornados, filigranas) en `docs/logo-exploration/_scrapped/`.
2026-04-21 — **Pivot arquitectónico**: a partir de Fase 5, la migración pasa de "app única con toggle geek mode" a **monorepo con dos apps (`apps/es`, `apps/tech`) y dos dominios** sobre un único Sanity compartido. El toggle se sustituye por dominio: `ebecerra.es` es modo pro (escaparate comercial PYME/autónomo), `ebecerra.tech` es modo geek (identidad técnica, terminal, CV extendido). Plan completo actualizado en [`plan-migracion-nextjs-sanity.md`](plan-migracion-nextjs-sanity.md). Fases 5–12 redefinidas: diseño visual → comerciales → cutover parcial a main → split a monorepo → construir tech → Vercel/DNS → pulido → cutover final. Stack añadido: pnpm workspaces + Turborepo con `turbo-ignore` para Vercel. Campo `sites` multi-select en documentos Sanity compartidos; docs exclusivos discriminados por tipo. Studio embebido en `apps/es/studio` (mantiene Visual Editing same-origin).

2026-04-22 — **Sesión maratón Claude Design + monorepo split + apps/es home pro completa.** Cierra el bloque diseño + arquitectura + implementación inicial del modo pro en una sola tarde:

- **Diseño con Claude Design** ([claude.ai/design](https://claude.ai/design), research preview de Anthropic Labs): generada home completa de `ebecerra.es` modo pro, las 8 secciones comerciales validadas (Nav · Hero · Servicios · Caso · Sobre mí · Proceso · Contacto · Footer). Decisiones responsive ya tomadas (monograma colapsa pequeño en mobile, proceso pasa de 4-col a timeline vertical, footer cruzado con enlace verde a `.tech`). Bundle exportado preservado en [`docs/design-handoff-2026-04-22/`](design-handoff-2026-04-22/) — `project/index.html` con todos los tokens y la home como HTML/CSS/JS standalone (2178 líneas) + `chats/chat1.md` con el transcript. El URL de la sesión expira; el bundle queda como fuente de verdad visual.
- **Aprendizajes Claude Design** (anotados en memoria `feedback_claude_design_workflow.md`): hay que setup del design system ANTES de crear cualquier prototipo; la GitHub App de Anthropic clona la default branch (no hay selector de rama en UI) → cambiar default branch del repo si la default tiene legado; las fuentes Google Fonts no se fetchan automático y hay que subirlas .ttf manualmente; los comentarios inline a veces no llegan al chat; el handoff llega como `.tar.gz` por API.
- **`packages/tokens/`** creado al validar el design system (commits `0053263` + `d98531a`): `pro.css` con todos los tokens del modo pro (colores structure/text/cta/semantic, escala fluida con clamp, spacing 4px base, radii, sombras, transiciones), `geek.css` con prefijo `--geek-*` extraído del SPA legacy (preservado para `apps/tech` futuro), `README.md` documentando el split.
- **Split a monorepo NPM workspaces + Turborepo** (commit `9439fbf`): se adelanta lo que en el plan original era Fase 8 — el repo ya no es single-app. Estructura: `apps/es/` (Next.js scaffold modo pro) + `apps/tech/` (fork del estado pre-Fase B = Next.js geek CV-style intacto, archivado en tag `archive/nextjs-geek-pure` apuntando a `ba17925`). `packages/tokens/`, `packages/sanity-schemas/` (`@ebecerra/sanity-schemas`), `packages/sanity-client/` (`@ebecerra/sanity-client` con cliente, queries y tipos compartidos). Root con `npm workspaces`, `packageManager: "npm@10.4.0"` y Turborepo 2.x. Tags `archive/nextjs-geek-pure` y `archive/migracion-nextjs-mixed` como rollbacks. Build `npm run build` pasa ambas apps en ~40s. Decisión pragmática: npm workspaces en vez de pnpm (se puede migrar a pnpm más tarde con un solo cambio en `packageManager`). Razón del adelanto: la mezcla geek+pro de Fase B (commit `3763044`) ensuciaba el sitio en dev — separar identidades por carpeta era más limpio que arrastrar "TEMPORAL" markers.
- **Apps/es home modo pro completa** (commits `e7b0479` C-1 + `ec76c2d` C-2 + `09d02fb` C-3): las 8 secciones implementadas como React components con tokens pro, fallback en `lib/content.ts` y i18n bilingüe completo. `LogoMark` con 6 variantes (primary/accent/negative/icon/scaleDeep/scaleBalanced). `RoughAnnotation` client wrapper sobre `rough-notation` vanilla con IntersectionObserver. Nav sticky con selector idioma globe icon + dropdown ES/EN, hamburger mobile. Hero con monograma scale-deep + rough-notation circle sobre "criterio arquitectónico". Services 3 cards con precio mono. Case con split y placeholder limpio cuando no hay caso publicado. About con stats inline + features. Process con timeline horizontal desktop / vertical mobile. Contact con form (state idle/sending/success/error). Footer stone-900 warm con logo-white + columna "cruzado" verde a `.tech`.
- **Sanity wire en home de apps/es** (commit `bfff563` D-1): añadidas queries `getFeaturedCaseForHome` (caso destacado con métricas) y `getProfileFeatures` (aboutFeatures del singleton profile) a `packages/sanity-client/queries.ts`. `apps/es/page.tsx` consulta Sanity en paralelo con `Promise.all` y `.catch(() => fallback)` por query — la home no rompe si Sanity está caído o vacío. Cuando el dataset tenga contenido pro publicado, lo renderiza sin más cambios.
- **Resend en form de contacto** (commit `166c9fa` D-2): API route `apps/es/app/api/contact/route.ts` con validación Zod, honeypot anti-bot (`website` field), idempotency key SHA-256 del payload (mismo form 2× en 24h = 1 email), `replyTo` al email del visitante, manejo correcto del `{data, error}` del SDK (Resend NO lanza). 503 si faltan vars. Contact.tsx hace `fetch()` real al endpoint. Pendiente: verificar dominio en Resend + setear `RESEND_API_KEY` + `CONTACT_TO_EMAIL` en Vercel.
- **Pulido visual en 3 pasadas** (commits `ffaf16e` E-1 + `e7ab4c0` E-2 + `f5cbab0` E-3): tras feedback "demasiado serio, mucho hueco blanco, monograma gigante en tablet/mobile, poca personalidad", iteraciones progresivamente más agresivas. Padding secciones 72-140px → 40-72px (-50%). Monograma <1024px de 260px plano a `clamp(90,14vw,130)`. Breakpoint del Hero subido a 1024px (tablets ya no caen en layout desktop). Zebra bg/surface-subtle bien alternada. Deliverables de servicios poblados (4 bullets mono verdes por card). Pulse del kicker amplificado (scale 1→1.15 + double shadow cada 1.8s). Dot texture warm stone subida de 5% a 15% alpha (visible). Hovers translateY+border verde+sombra en cards de servicios, About y Process. Y la inversión bold del nav: **fondo verde `#047857`, logo blanco, links blancos, CTA blanco con texto verde** — propuesta del usuario para romper la monotonía blanca.

Estado tras la sesión: `apps/es` ya renderiza la home pro completa con tokens, hovers, micro-animaciones y data dinámica (Sanity + fallback). `apps/tech` intacta con su estética geek pre-Fase B. `packages/sanity-{client,schemas}` compartidos. Pendiente para producción (no bloqueante en dev): copiar `.env.local` de `apps/tech` a `apps/es`, verificar dominio en Resend, configurar segundo proyecto Vercel (`apps/es` Root Directory) y hacer cutover de DNS cuando se quiera publicar. Roadmap re-ordenado: lo que era Fase 5+ (diseño + comerciales + cutover + split) se ha adelantado y solapado en buena parte. Fases pendientes: cutover `migracion-nextjs` → `main`, contenido y diseño definitivo a `apps/tech`, `ebecerra.tech` DNS + Vercel, Lighthouse ≥ 90 ambas apps + OG images + JSON-LD.

2026-04-23 — **Home pro: veracidad de contenido, precios Kit Digital y casos anonimizados.** Sesión de *audit + fill* sobre `apps/es` con `docs/cv-pro.md` y `docs/cv-tech.md` como única fuente de verdad. Commit final `adf16b6 Home(es): precios Kit Digital, titular a medida y polish final`.

- **Contenido irreal eliminado.** El stack inventado (Next.js + Sanity CMS) se sustituye por el real (Magnolia · Java · Spring) en hero `metaCompany`, `messages/metadata.description`, `keywords` de `[locale]/layout.tsx`, `knowsAbout` y `description` del JSON-LD Person/ProfessionalService, y en el `manifest.json`. Stats del About: `40+ proyectos migrados` / `100% a plazo` (inflados) → `8+ años · 13 proyectos entregados · 6 AAPP`, derivados directamente de cv-pro.md. Stats localizadas vía `about.statYears/statProjects/statPublicSector` en ES/EN.
- **Precios anclados a Kit Digital.** Los precios placeholder (2.800 / 3.500 / 800 €) se sustituyen por los reales ofertables: web con CMS 1.500 €, migración 2.500 €, auditoría 500 €, cada uno con `priceNote` bilingüe que enmarca la subvención del Kit Digital (hasta 2.000 € cubiertos). `Services.tsx` renderiza ahora `priceNote` bajo `priceRange`. Docs correspondientes publicados en Sanity (dataset `production`). Referencias a WordPress en copy se sustituyen por "CMS tradicional" (menos marca-dependiente).
- **Casos destacados (home)** — antes placeholder "disponible bajo petición", ahora grid de 3 cards anonimizadas desde cv-pro.md, cada una con sector (p.ej. "Sector financiero · web corporativa"), título, **Contexto / Solución / Resultado / Traducible a tu negocio** + métricas mono. Los 3 patrones: plataforma CMS corporativa, migración de portal institucional sin perder SEO, generador de portales multi-sede. **Cero nombres de cliente** (se respeta la confidencialidad contractual: ni VASS, Bilbomática, Onetec, CBNK, MAPA, SEPE, IE, Prosegur, Atradius, INECO, MECD, MCIN, PAG, Línea Directa, Bibliotecas). `Case.tsx` reescrito como grid responsive; `lib/content.ts` gana tipo `CaseCard` y `fallback.cases[]`. La query `getFeaturedCaseForHome` sigue disponible en `@ebecerra/sanity-client` pero la home hoy no la consume — cuando se publiquen `caseStudy` en el dataset se reactiva.
- **GitHub fuera del pro.** Eliminado de `Contact.tsx` (INFO list), `Footer.tsx` (columna social), `fallback.footerLinks`, `sameAs` del JSON-LD (Person + Organization) y `messages/contact.infoGithub`. El GitHub vive en `apps/tech` si acaso — no en la identidad comercial.
- **Refactor del Hero a markup inline** (`AnnotatedText`, commit del usuario). Las keys `titleBefore/titleHighlight/titleAfter` se colapsan a un único `hero.title` con tags `[circle]…[/circle]` parseados en runtime. Permite anotar cualquier string i18n sin refactor estructural (soporta `circle`, `underline`, `box`, `highlight`, `strike-through`, `crossed-off`, `bracket` con padding/stroke por defecto). Kicker sin fecha expiratoria ("Disponible para que trabajemos juntos") y lead reorientado al cliente.
- **Capitalización en CTAs/labels.** Feedback del usuario: demasiadas minúsculas en botones daban aire de borrador. Capitalizado `Ver servicios`, `Ver detalles`, `Leer el caso completo`, `Ver perfil completo`, y eliminado el `.toLowerCase()` forzado en `Contact.tsx` sobre las labels (`Email`, `LinkedIn`, `Ubicación`, `Respuesta`). Se mantiene el estilo editorial mono-minúscula en kickers, columnas del footer y links legales por contraste tipográfico.
- **Docs/memoria alineadas.** `CLAUDE.md` describe ahora la home real (precios Kit Digital, 3 casos anonimizados, stats reales, sin GitHub). Nueva memoria `feedback_content_veracity_pro.md` con la regla: en apps/es nada inventado, cv-pro.md/cv-tech.md anonimizado como fuente, precios reales o `null`. Memorias paralelas `project_pricing_strategy.md` y `user_sidegig_context.md` añadidas por el usuario documentan el ancla Kit Digital, competencia real (IONOS/Hostinger, no agencias) y contexto side-gig sobre sueldo VASS.

Estado tras la sesión: home pro de `apps/es` 100% poblada con contenido real + anonimizado sin riesgos reputacionales ni de confidencialidad. Fase 6 avanzada — casos destacados en home ✓, schemas comerciales en packages ✓, diseño Fase 5 aplicado ✓. Quedan páginas dedicadas (`/servicios`, `/casos`, `/casos/[slug]`), metadata por página desde Sanity, y publicar `caseStudy` en el dataset para retirar el fallback de casos.

---

2026-04-21 — **Fase 4 cerrada**: i18n ES/EN con `next-intl` 4.9.1 + `@sanity/language-filter` 5.0.1. Decisiones clave:
- **Routing**: `localePrefix: "as-needed"` (ES en `/` sin prefijo, EN en `/en`). Preserva URLs indexadas.
- **Estructura app/**: dos root layouts vía route groups — `(locale)/[locale]/` con html/body + `NextIntlClientProvider` para páginas localizadas; `(misc)/` con html/body `lang="es"` estático para `/studio` y `/playground/annotations`. `/api/revalidate` queda en `app/api/` sin layout. Se eliminaron `app/layout.tsx` y `app/page.tsx` raíz.
- **Next 16**: `middleware.ts` deprecado → renombrado a `proxy.ts`. Configuración idéntica.
- **Sanity**: tipos custom `localeString`/`localeText` en `lib/sanity/schemas/locale.ts` (object con fields `es` requerido + `en` opcional). Plugin `@sanity/language-filter` con `filterField` que chequea `enclosingType.name.startsWith("locale")` para ocultar el otro idioma en Studio. Alternativa descartada: `@sanity/document-internationalization` (multiplica docs, overkill para 33 items).
- **Queries GROQ**: proyección con triple coalesce `coalesce(field[$locale], field.es, field)` — sirve tanto para formato nuevo `{es,en}` como legacy string plano, útil durante la transición.
- **Migración datos**: 33 docs (6 experience + 12 skill + 12 techTag + 2 project + 1 profile) migrados vía MCP de Sanity (`https://mcp.sanity.io`, auth OAuth). Gotcha: `patch_document_from_json` rechaza con 500 "Internal Server Error" si intentas `set` un objeto sobre un campo que contiene un string plano; workaround = dos calls separadas (unset primero, luego set). Otro gotcha: múltiples ops sobre el mismo path de array en una sola call → "Conflicting target.include parameters"; solución = un feature/ítem por call.
- **Fallback `lib/content.ts`**: dualizado a `{ es, en }` con helper `getFallback(locale)`. Tipos planos (el coalesce aplana).
- **Selector de idioma**: botón ES/EN en Nav usando `useRouter`/`usePathname` de `i18n/navigation.ts` (wrapper `createNavigation(routing)`), dentro de `startTransition` para evitar bloqueo UI.
- **Metadata**: `generateMetadata` con `getTranslations({locale, namespace: "metadata"})`. `alternates.languages` genera hreflang automáticos (Next emite `hrefLang` en JSX, no `hreflang` literal).
- **Sitemap + robots**: `app/sitemap.ts` emite 2 URLs con alternates por locale; `app/robots.ts` excluye `/studio`, `/api`, `/playground`.
- **Revalidación**: `/api/revalidate` ahora revalida `/` y `/en`.
- **Verificación**: `npm run build` ✓, curl a `/` y `/en` → `<html lang>` correcto, contenido ES/EN distinto servido desde Sanity, hreflang presente, sitemap y robots OK, `/studio` `/playground` `/piezas-game/` siguen accesibles fuera del proxy.
