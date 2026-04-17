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
- [ ] Deploy a staging en Vercel (preview URL via PR o push a rama)
- [ ] Validar `/piezas-game/*` y `/.well-known/assetlinks.json` en staging

## Fase 2 — Port 1:1 con contenido hardcoded (10–14h)

- [ ] Portar Nav (hamburger + scroll)
- [ ] Portar Hero (terminal interactiva completa)
- [ ] Portar About (bio + feature cards)
- [ ] Portar Experience (timeline)
- [ ] Portar Skills (barras animadas + tags)
- [ ] Portar Projects (cards con links)
- [ ] Portar Contact (form Formspree)
- [ ] Portar Footer
- [ ] Contenido centralizado en `lib/content.ts` temporal
- [ ] Paridad visual con sitio actual verificada
- [ ] Lighthouse ≥ 90 en staging

## Fase 3 — Integración de Sanity (8–12h)

- [ ] Crear proyecto Sanity con dataset `production`
- [ ] Schemas: siteSettings, profile, experience, skill, techTag, project
- [ ] Studio embebido en `/studio`
- [ ] Migrar contenido de `lib/content.ts` a Sanity (manual o script)
- [ ] Queries GROQ en `lib/sanity/queries.ts`
- [ ] Reemplazar imports hardcoded por fetches de Sanity
- [ ] ISR + webhook de revalidación (`/api/revalidate`)
- [ ] Verificar: editar texto en Studio → visible en staging

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
