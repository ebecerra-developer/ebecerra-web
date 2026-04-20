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

- [ ] Configurar `next-intl` con routing `/es` y `/en`
- [ ] Migrar textos de UI a `messages/es.json` y `messages/en.json`
- [ ] Convertir campos Sanity a `localeString`/`localeText`
- [ ] Traducir contenido base al inglés
- [ ] Middleware de detección de idioma + selector en Nav
- [ ] `hreflang` + `sitemap.ts` bilingüe
- [ ] Verificar: `/es` y `/en` renderizan contenidos distintos

## Fase 5 — Secciones comerciales nuevas (10–14h)

- [ ] Schemas: service, processStep, caseStudy
- [ ] Página `/servicios` con listado + sección "Proceso"
- [ ] Página `/casos` (listado)
- [ ] Página `/casos/[slug]` (detalle con PortableText)
- [ ] Home: sección "Casos destacados" + CTAs de conversión
- [ ] SEO por página (`generateMetadata` desde Sanity)
- [ ] Contenido real de servicios cargado en Sanity
- [ ] Al menos 1 caso de estudio real publicado

## Fase 6 — Geek mode toggle (6–8h)

- [ ] `GeekModeProvider` con context + `localStorage`
- [ ] Tokens Tailwind duales (profesional / geek) vía `data-mode`
- [ ] Variantes de Hero, Nav, tipografía en geek mode
- [ ] Terminal interactiva visible solo en geek mode
- [ ] Toggle `</>` accesible desde Nav
- [ ] Persistencia SSR-safe (sin FOUC inaceptable)
- [ ] Verificar: toggle persiste entre recargas

## Fase 7 — Form, analítica, pulido (4–6h)

- [ ] Decidir e implementar Formspree vs Resend (`/api/contact`)
- [ ] Open Graph images (estáticas o `@vercel/og`)
- [ ] `robots.ts`, `sitemap.ts` definitivos
- [ ] Schema.org JSON-LD (Person + ProfessionalService)
- [ ] Auditoría Lighthouse vs baseline de Fase 0
- [ ] Corregir cualquier regresión

## Fase 8 — Cutover a producción (2–3h)

- [ ] Apuntar `ebecerra.es` al deploy Next.js
- [ ] Redirects 301 de rutas antiguas si aplica
- [ ] Validar `/piezas-game/*` en producción
- [ ] Monitorizar analytics 48h
- [ ] Archivar repo Vite antiguo

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
