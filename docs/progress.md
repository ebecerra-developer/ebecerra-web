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

## Fase 5 — Diseño visual de ambos modos (6–10h)

Decisión de herramienta: exploración visual en **Claude web con Artifacts/Canvas**; implementación en **Claude Code** con skills `/frontend-design`, `/tailwind-design-system`, `/shadcn`, `/web-design-guidelines`. Output de exploración guardado en `docs/design/`.

- [ ] Mockups home `.es` (pro): hero con propuesta de valor, servicios, casos destacados, CTAs
- [ ] Mockups home `.tech` (geek evolucionado): terminal protagonista + CV técnico + easter eggs
- [ ] Mockups `/servicios`, `/casos/[slug]` y equivalentes técnicos en `.tech`
- [ ] Consolidar tokens pro en `docs/design-tokens-pro.md` (ya existe) y crear `docs/design-tokens-geek.md`
- [ ] Decidir tipografías dominantes, densidad, iconografía y sistema de anotaciones por modo
- [ ] Review con el creador antes de implementar

## Fase 6 — Secciones comerciales sobre app única (10–14h)

Se trabaja aún sobre `migracion-nextjs` (monoapp). La app ya se ve y siente como el futuro `apps/es`.

- [ ] Schemas: service, processStep, caseStudy (en `lib/sanity/schemas/`, se moverán a `packages/sanity-schemas` en Fase 8)
- [ ] Página `/servicios` con listado + sección "Proceso"
- [ ] Página `/casos` (listado)
- [ ] Página `/casos/[slug]` (detalle con PortableText)
- [ ] Home: sección "Casos destacados" + CTAs de conversión
- [ ] `generateMetadata` desde Sanity por página
- [ ] Contenido real cargado: 3–4 servicios + 1 caso de estudio mínimo
- [ ] Aplicar diseño Fase 5 al home y secciones nuevas
- [ ] Evaluar retirada del fallback `lib/content.ts` si Sanity está sólido

## Fase 7 — Cutover parcial: merge a `main` y prod (2–3h)

Producción pasa a Next.js **antes** del split para validar la arquitectura nueva con tráfico real.

- [ ] Review final `migracion-nextjs` vs `main`
- [ ] Merge a `main` (PR + squash)
- [ ] Verificación en `ebecerra.es`: home, `/en`, navegación, `/piezas-game/*`, `/.well-known/assetlinks.json`, `/studio`, form, sitemap, robots
- [ ] Lighthouse en prod ≥ 90 en las 4 categorías
- [ ] Actualizar CORS Sanity con el dominio de producción si difiere
- [ ] Monitorizar Analytics + Speed Insights 48h
- [ ] Rama `migracion-nextjs` mergeada; Vite retirado (código sigue en git history por si acaso)

## Fase 8 — Split a monorepo (8–12h)

Rama nueva `split-monorepo` desde `main` post-Fase 7.

- [ ] Setup raíz: `pnpm-workspace.yaml`, `turbo.json`, `package.json` raíz
- [ ] Mover árbol actual a `apps/es/` (git mv preservando historia)
- [ ] Extraer `packages/sanity-schemas`, `packages/sanity-client` (con parámetro `site` en queries), `packages/tokens`, `packages/ui`, `packages/utils`
- [ ] Crear `apps/tech/` como copia inicial de `apps/es/` (placeholder "Hello tech world")
- [ ] Verificación local: `pnpm install`, `pnpm --filter @ebecerra/es dev`, `pnpm --filter @ebecerra/tech dev`, `pnpm turbo build`
- [ ] Preview Vercel con dos proyectos (ver Fase 10)
- [ ] Cobertura funcional de `apps/es` idéntica a pre-split

## Fase 9 — Construir `apps/tech` (12–16h)

- [ ] Aplicar diseño geek de Fase 5 a `apps/tech`
- [ ] Hero con terminal interactiva (migrar desde `apps/es` si quedó ahí)
- [ ] CV técnico extendido en `/sobre-mi`
- [ ] `/proyectos` y `/proyectos/[slug]` con perspectiva técnica
- [ ] Easter eggs reactivados y pulidos
- [ ] (Opcional) scaffold de `/blog`
- [ ] Queries filtradas con `site: 'tech'`
- [ ] `<CrossDomainLink />` en Nav y footer apuntando a `ebecerra.es`
- [ ] Schema.org JSON-LD Person técnico

## Fase 10 — Vercel + DNS para `.tech` (2–4h)

Detalle en [`plan-migracion-nextjs-sanity.md`](plan-migracion-nextjs-sanity.md#4-configuración-vercel--dns--pasos-manuales).

- [ ] Reconfigurar proyecto existente para `apps/es` (Root Directory + Ignored Build Step `npx turbo-ignore @ebecerra/es`)
- [ ] Crear proyecto nuevo `ebecerra-web-tech` (Root Directory `apps/tech` + `npx turbo-ignore @ebecerra/tech`)
- [ ] Replicar env vars Sanity + Resend en ambos proyectos
- [ ] Asignar `ebecerra.tech` y `www.ebecerra.tech` al proyecto nuevo (DNS ya en Vercel)
- [ ] CORS Sanity: añadir `https://ebecerra.tech` + `www`
- [ ] Webhook de revalidación adicional apuntando a `ebecerra.tech/api/revalidate`
- [ ] Verificar SSL en ambos dominios

## Fase 11 — Form + SEO + pulido (6–8h)

- [ ] `/api/contact` con Resend en `apps/es` (validación Zod + rate limit + idempotency + Turnstile/reCAPTCHA)
- [ ] Opcional: form de contacto en `apps/tech` con copy técnico
- [ ] OG images con `@vercel/og` dinámicas por caso y proyecto
- [ ] Schema.org JSON-LD completo por app (Person, ProfessionalService, Article, CreativeWork)
- [ ] Sitemaps y robots por dominio
- [ ] Lighthouse ≥ 90 en ambos dominios
- [ ] `error.tsx`, `global-error.tsx`, `not-found.tsx` con copy por modo

## Fase 12 — Cutover final del monorepo (2–3h)

- [ ] Merge `split-monorepo` → `main`
- [ ] Ambos proyectos Vercel despliegan en paralelo
- [ ] Validación final en ambos dominios, ambas locales, `/piezas-game/*`, form real, Studio editable
- [ ] Monitorizar 48h: analytics, speed insights, errores
- [ ] Comunicación pública (LinkedIn pro + tech según corresponda)

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
