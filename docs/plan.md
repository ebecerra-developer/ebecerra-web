# Plan de trabajo — ebecerra-web

**Estado actual (2026-05-10):** `main` es el monorepo en producción con tres apps activas:

- `apps/es` → [ebecerra.es](https://ebecerra.es) — home con 6 secciones numeradas (01 Servicios · 02 Sobre mí · 03 Capacidades · 04 Cómo trabajamos · 05 Ejemplos · 06 Contacto). Stats y features client-facing tras pivote comercial.
- `apps/tech` → [ebecerra.tech](https://ebecerra.tech) — modo geek live desde 2026-04-24.
- `apps/demos` → [demos.ebecerra.es](https://demos.ebecerra.es) — subdominio de demos navegables, activa desde 2026-05-09. Plantilla `fisio` con demo `equilibrio` (anonimizada, bilingüe ES/EN, paleta madera + petrol blue, hamburger mobile-first).

Sanity `gdtxcn4l/production` compartido. Webhook fan-out desde apps/es cubre los 3 dominios.

**Tracking:** checkboxes `[ ]` / `[x]` inline en este archivo. Decisiones dateadas y bloqueos en [`progress.md`](progress.md). Plan y progreso originales (Fases 0–9: migración Vite → Next + Sanity + monorepo + cutover) archivados en [`archive/`](archive/).

---

## Fase A — Sanity editorial completo

**Objetivo:** mover todo el copy comercial editable a Sanity. Dejar en `messages/*.json` solo UI chrome (labels de formulario, estados, aria-labels, separadores, copyright format).

**Frontera:** si el editor querría cambiarlo sin redeploy → Sanity. Si es chrome que cambia con código → messages.

### A1 — Schemas base

- [x] `heroSection` singleton: kicker, title (con markup `[circle]`), lead, ctaPrimary, ctaSecondary, trustBadges[]
- [x] `siteSettings` singleton: metadata (title, descriptions, OG, Twitter, keywords[localeString]), footer (tagline, availability, socialLinks[]). Contacto vive en `profile.contact`.
- [x] `serviceSectionMeta`, `processSectionMeta`, `casesSectionMeta`, `contactSectionMeta` singletons (kicker, title, lead + auditStrip en services)
- [x] Extender `profile` con `name`, `jobTitle`, `bio1`, `bio2`, `stats[]` (value, label), `contact` (email, linkedinUrl, location, responseTime)
- [x] `faqPage` singleton (metaTitle, metaDescription, title, lead, contactSectionTitle, contactSectionLead, contactCta) + `faqItem` colección (question, answer, order, category)
- [x] `legalPage` colección: slug, title, metaDescription, content (localePortableText), updatedAt
- [x] Studio: `customStructure` con `documentId` fijo por singleton + `document.actions` filter bloqueando create/delete/duplicate/unpublish + `newDocumentOptions` filter en creationContext global
- [x] Deploy: `npx sanity schema deploy` desde Studio embebido (20 types deployados en workspace `ebecerra-web`)

### A2 — Quick wins (ROI alto)

- [x] Queries en `packages/sanity-client/queries.ts` con fallback seguro por query (`.catch(() => null)`)
- [x] Hero lee de `heroSection`
- [x] Metadata OG desde `siteSettings.metadata` en `generateMetadata`
- [x] Contact info (email, LinkedIn, location, SLA) desde `profile.contact`

### A3 — Secciones de home

- [x] Services title/lead/audit strip desde `serviceSectionMeta`
- [x] Process title/lead desde `processSectionMeta`
- [x] Cases title/lead desde `casesSectionMeta`
- [x] About bio + stats desde `profile` extendido
- [x] Contact section header desde `contactSectionMeta`
- [x] Footer tagline + availability desde `siteSettings`

### A4 — FAQ y legales

- [x] FAQ headers desde `faqPage`
- [x] FAQ items desde colección `faqItem` ordenados por `order`
- [x] Ruta dinámica `/[slug]` para legal pages bajo `app/(locale)/[locale]/`
- [x] Migrar privacy content existente a `legalPage` con slug `privacidad` (+ EN)
- [x] Borrar PrivacyEs/En hardcodeados una vez validado

### A5 — Structured Data dinámico

- [x] JSON-LD (Person, Organization, WebSite, Service) alimentado desde `siteSettings`
- [x] Verificar con Google Rich Results Test — OK (2026-04-23): detecta "Empresas locales" y "Organización", ambos válidos con warnings no críticos. Warnings: falta `telephone` en Organización, y `postalCode`/`streetAddress` en PostalAddress. Omitidos intencionalmente (freelance sin dirección pública). Revisar si se añaden en el futuro.
- [x] Extraer `Service` schema del JSON-LD desde docs `service` publicados

**Riesgo principal:** Sanity down → cada sección debe degradar al fallback local de `messages/*.json` sin romper la home.

---

## Fase B — Refactor CSS inline → archivos

**Objetivo:** eliminar `style={{...}}` de los componentes.

**Decisión (2026-04-23):** **CSS Modules co-located.** Cada componente con su `*.module.css` en la misma carpeta. Consumen tokens de `packages/tokens/*.css` vía `var(--…)`. Tailwind v4 sigue presente pero no se usa para composición. Convenciones en el skill `/css-conventions`.

### B1 — Refactor por componente

Orden recomendado: empezar por los grandes (Hero, Services) para validar la convención antes de propagarla.

- [x] `Nav.tsx`
- [x] `Hero.tsx`
- [x] `Services.tsx` (incluye audit strip)
- [x] `Case.tsx`
- [x] `About.tsx`
- [x] `Process.tsx`
- [x] `Contact.tsx`
- [x] `Footer.tsx`
- [x] `LogoMark.tsx` (width/display al module; height sigue inline — valor generado por prop)
- [x] `faq/page.tsx` + extracción `components/faq/{FaqIntro,FaqList,FaqItem,FaqContactBlock}` con modules co-located
- [x] `[slug]/page.tsx` + extracción `components/legal/LegalContent` con module co-located

**Orden con Fase A:** B va después de A en teoría (para no tocar los mismos archivos dos veces). En la práctica la separación CSS/datos es limpia: B solo toca estilos; A toca props y queries en `page.tsx`. No hubo conflicto haciéndolas en paralelo — nota obsoleta.

---

## Fase C — Pulido pendiente del plan anterior

Ítems que quedaban sueltos antes de archivar el plan original.

- [x] `error.tsx` + `not-found.tsx` en `apps/es` con copy pro (`app/(locale)/[locale]/error.tsx` + `app/not-found.tsx` con CSS Modules co-located)
- [x] OG image dinámica con `next/og` (`app/opengraph-image.tsx`, runtime edge, 1200×630)
- [x] Auditoría Lighthouse ≥ 90 en Perf/A11y/Best/SEO contra `ebecerra.es` prod (2026-04-24 móvil: 99/96/100/100 · escritorio: 100/96/100/100)
- [x] Verificar CORS Sanity con dominios prod (ebecerra.es, www.ebecerra.es, localhost:3000, https://localhost:3000 — todos Allowed)
- [x] Verificar webhook de Sanity revalidando `/` y `/en` tras publish real (verificado 2026-04-24: trailing slash + useCdn false + revalidatePath layout)

---

## Fase D — Cutover `ebecerra.tech` ✓ completada (2026-04-24)

- [x] Proyecto Vercel 2 apuntando a `apps/tech` (Root Directory) con `turbo-ignore`
- [x] Env vars replicadas
- [x] Dominio `ebecerra.tech` + `www.ebecerra.tech` asignados al proyecto Vercel 2
- [x] CORS Sanity con los 4 dominios
- [x] Webhook adicional Sanity → `https://ebecerra.tech/api/revalidate/` (con trailing slash)
- [x] SSL verificado
- [x] Easter eggs del SPA original reactivados en Hero (terminal) — TerminalHero ya portada en apps/tech con comandos interactivos
- [ ] Comunicación pública (LinkedIn tech)

---

## Fase F — Demos para clientes (`demos.ebecerra.es`) ✓ activa desde 2026-05-09

**Objetivo cumplido:** webs de ejemplo navegables (clínica fisio anonimizada hoy; dental, abogados, coach… pendientes) para enseñar a clientes potenciales lo que pueden tener. Cada demo accesible por URL propia, editable desde Sanity con interfaz simple, imágenes vía AI generation (Sanity MCP) o Media Library nativa.

**Decisiones (2026-05-09 → 2026-05-10):**

- **App separada `apps/demos`** servida en subdominio `demos.ebecerra.es`. Reusa `@ebecerra/sanity-client`, `@ebecerra/sanity-schemas` y `@ebecerra/tokens`.
- **Schema único `demoSite`** con campo `template` (select), bloques editoriales y `brandOverrides` (paleta + logo) para personalizar sin tocar código.
- **Imágenes:** plugin Unsplash NO compatible con sanity v5. Workflow real = `mcp__sanity__generate_image` (IA) + Media Library nativa para upload manual.
- **Studio:** custom structure con sección "Demos de webs". Presentation tool pendiente (F5).
- **SEO:** demos individuales `demos.ebecerra.es/{locale}/{slug}` → `noindex` (header HTTP + meta + robots.ts). Galería pública `ebecerra.es/ejemplos` indexada con JSON-LD ItemList.
- **i18n:** `localeString`/`localeText` desde el inicio. Demos monolingües dejan EN vacío. Primera demo (fisio Equilibrio) bilingüe.
- **DNS:** registro CNAME `demos` → `cname.vercel-dns.com` en panel DonDominio.
- **Webhooks:** plan free Sanity = 2 webhooks. Patrón fan-out: `apps/es/api/revalidate` reenvía a `demos.ebecerra.es/api/revalidate` cuando `_type == "demoSite"`. Un único webhook cubre 3 dominios.

### F1 — Scaffold del subdominio ✓

- [x] Crear `apps/demos` (Next.js 16 + TS + Tailwind v4 + next-intl 4) copiando estructura mínima de `apps/es`
- [x] Wiring de `@ebecerra/sanity-client`, `@ebecerra/sanity-schemas`, `@ebecerra/tokens`
- [x] Layout raíz, `not-found.tsx`, `robots.ts` noindex global, X-Robots-Tag header en next.config
- [x] Crear proyecto Vercel `ebecerra-demos` (root `apps/demos`)
- [x] Añadir dominio `demos.ebecerra.es` en Vercel + CNAME en DonDominio
- [x] Env var `SANITY_REVALIDATE_SECRET` (mismo valor que apps/es)
- [x] Añadir `https://demos.ebecerra.es` a CORS de Sanity
- [x] Smoke test: deploy en producción, SSL OK
- [x] Webhook fan-out desde `apps/es/api/revalidate` (no webhook adicional Sanity, plan free)

### F2 — Schema `demoSite` + integración con Studio ✓

- [x] Schema `demoSite` en `packages/sanity-schemas` con slug, template, brand overrides (logo, colores, bgTone), bilingüe completo, hero, about, services[], team[], testimonials[], contact con horario+social
- [x] Campos de copy como `localeString`/`localeText`
- [x] Custom structure: sección "Demos de webs" en el Studio embebido de apps/es
- [x] Deploy schema (`npx sanity schema deploy`)
- [x] Doc Equilibrio creado y publicado vía MCP
- [ ] ~~Plugin Unsplash~~ — abandonado (no soporta sanity v5). En su lugar: `mcp__sanity__generate_image`

### F3 — Plantilla "fisio" + demo Equilibrio (anonimizada, sustituye a la idea inicial Elena/BeeMovement) ✓

- [x] Tokens en `packages/tokens/demos-fisio.css` con paleta cream paper + walnut + petrol blue + terracota. Tipografía Fraunces serif + DM Sans
- [x] Componentes: FisioNav (con FisioNavMobile hamburger drawer), FisioHero (full-bleed bg image), FisioAbout, FisioBannerCta, FisioServices, FisioTeam, FisioTestimonials, FisioBooking (mock slots), FisioContact con FisioContactForm (client + estado submit/success), FisioFooter
- [x] Página `app/[locale]/[slug]/page.tsx` con switch por `template`
- [x] DemoBanner no-sticky en cabecera
- [x] Doc Equilibrio en Sanity con copy ES + EN, 5 servicios, 3 miembros equipo, 3 testimonios, 5 imágenes IA generadas (hero, about, thumbnail, 3 portraits)
- [x] Switcher ES/EN funcional condicionado por `enableEnglish`
- [x] Hamburger nav móvil con CTA dentro y lang switcher fuera (criterio mobile-first)
- [x] La raíz `demos.ebecerra.es/` renderiza la primera demo publicada (no listado intermedio)

### F4 — Galería pública en `apps/es` ✓

- [x] Página `app/(locale)/[locale]/ejemplos/page.tsx` listando demos `publishedToGallery == true`
- [x] Cada tarjeta: thumbnail, sector, nombre, descripción corta, CTA "Ver demo" → `demos.ebecerra.es/{slug}/`
- [x] Indexable. Metadata + JSON-LD `ItemList`
- [x] Sección Examples (numerada 05) en home también muestra preview
- [x] Link "Ejemplos" en nav y footer
- [ ] ~~Schema `demosGallery` singleton~~ — descartado. Copy del header en `messages/*.json` (suficiente, no requiere edición editorial)

### F5 — Presentation tool / Visual Editing (opcional, pendiente)

Argumento de venta frente a WordPress: el cliente edita en una columna y ve el cambio aplicado en la otra.

- [ ] `presentationTool({ previewUrl, allowOrigins })` en `apps/es/sanity.config.ts` con `previewUrl.initial = 'https://demos.ebecerra.es'` y `allowOrigins` incluyendo `demos.ebecerra.es` + `localhost`
- [ ] Route handler `apps/demos/app/api/draft-mode/enable/route.ts` validando secret y llamando `draftMode().enable()`
- [ ] `<VisualEditing />` en layout cuando `draftMode().isEnabled`
- [ ] Switch a `next-sanity`'s `sanityFetch` con `stega: true` para overlays click-to-edit
- [ ] Resolver de URL de preview a partir del documento (slug → `/{locale}/{slug}`)

### F6 — Plantillas adicionales (rolling)

Sacar conforme haga falta. Cada plantilla es una sesión propia. **Principio aprendido (2026-05-10):** no hacer "una plantilla coach genérica" con paletas — cada perfil de cliente diferenciado lleva plantilla propia con componentes/layout/tokens propios. Ver Política #8 en CLAUDE.md.

Schema mejorado (2026-05-10) para soportar variedad: `services[].image`, `lifestyleGallery[]`, validación referencial custom en `pricing.tiers[].prices[].modalityId` ↔ `pricing.modalities[].id`.

- [x] Plantilla `coach-editorial` (premium · mujer 35-55) — 11 componentes propios (`EditorialNav`, `EditorialHero` split asimétrico, `EditorialAbout` magazine spread, `EditorialServices` lista índice numerada con imagen lifestyle, `EditorialLifestyleStrip`, `EditorialBannerCta` dark warm, `EditorialPricing` tabla sobria, `EditorialTestimonials` pull-quote, `EditorialBookingNote` sin calendario, `EditorialContact`, `EditorialFooter`). Tokens `demos-coach-editorial.css` (off-white + dusty rose + burdeos + dark warm reservado). Tipografía Cormorant Garamond italic + Inter. Demo `/marta-solana`.
- [x] Plantilla `coach-vibrant` (marca personal · generalista) — 11 componentes propios (`VibrantNav` con CTA pill, `VibrantHero` con stickers blob magenta/lilac/acid + imagen circular, `VibrantStats` ticker pills, `VibrantAbout` con bg-block, `VibrantServices` cards bold rotando 4 tonos con shadow offset, `VibrantObjectives`, `VibrantInstagramFeed` collage asimétrico, `VibrantBannerCta` magenta full-bleed, `VibrantTestimonials` cards estilo screenshot rotadas, `VibrantContact` bloques WhatsApp/IG sin form formal, `VibrantFooter`). Tokens `demos-coach-vibrant.css` (cremoso + magenta + verde ácido + lila + tinta morada). Tipografía Space Grotesk black + Manrope. Demo `/claudia-entrena`.
- [ ] Plantilla `joyeria`
- [ ] Plantilla `dental`
- [ ] Plantilla `legal` (despacho de abogados)
- [ ] Plantilla `asesoria`
- [ ] Plantilla `restaurante`

**Mejoras opcionales del schema detectadas durante G2-G5:**

- [ ] Schema `instagramFeed`: añadir `bio` y `followers` para reforzar credibilidad del header del módulo (hoy solo expone handle + posts).
- [ ] Schema `services[]`: ya tiene `image` opcional desde 2026-05-10. Plantilla fisio podría empezar a usarla.
- [ ] Aspect ratios IA inconsistentes: `mcp__sanity__generate_image` no garantiza el ratio exacto del prompt. Si hace falta vertical 4:5 estricto para hero editorial, post-procesar o regenerar.
- [ ] Eliminar campo `brand.fontPair` (residuo de la plantilla `coach` genérica eliminada — las plantillas nuevas tienen tipografía propia en sus tokens).

### F7 — Demo "BeeMovement" (privada, para Alejandra) — pendiente

Demo branded con paleta/logo de BeeMovement Fisioterapia. URL accesible solo con link directo (`publishedToGallery: false`). Borrar o despublicar tras enseñar.

- [ ] Crear doc en Sanity con `template: "fisio"` y brand overrides (colores y logo de BeeMovement)
- [ ] Copy adaptado a su estructura actual (basado en beemovementfisioterapia.com)
- [ ] Pasar URL a Alejandra
- [ ] Tras feedback: borrar o convertir en proyecto si contrata

---

## Fase G — Iteración comercial home apps/es ✓ (2026-05-09 → 2026-05-10)

Refactor del posicionamiento comercial de la home tras feedback con foco en target real (autónomos/PYMEs, no perfil tech).

- [x] Stats client-facing: `8+ años de oficio` / `1:1 trato directo, sin intermediarios` / `100% código tuyo, sin lock-in`. Antes: 150+ proyectos, 20 AAPP (no verificables, no relevantes)
- [x] About features: 4 cards 2x2 (Arquitectura · Formación técnica · Sectores críticos · Stack moderno con IA). Magnolia / Java & Spring fuera (jerga tech invisible al cliente final)
- [x] Sección Casos eliminada (anonimizada bajo NDA, ocupaba mucho, prueba social ahora vive en Examples)
- [x] **Nueva sección Capacidades (03)**: 4 cards (Asistente IA con badge "Nuevo", Reservas online, Integraciones, Datos para decidir). Bullets concretos por card. Nota inferior: capacidades modulares y opcionales
- [x] Examples como sección numerada 05 (entre Cómo trabajamos y Contacto)
- [x] Numeración renumerada: 01 Servicios · 02 Sobre mí · 03 Capacidades · 04 Cómo trabajamos · 05 Ejemplos · 06 Contacto
- [x] Nav y Footer actualizados con los 6 pilares
- [x] CTAs unificados (pill, weight 600, translateY hover, color explícito en :hover para evitar bug global)
- [x] Footer cleanup: duplicado de "ejemplos" eliminado, icono ✉ en Email para consistencia
- [x] Política #6 (verdad de contenido) extendida con prohibición de jerga técnica visible al cliente
- [x] Política #7 (mobile-first + hamburger nav por defecto) añadida a CLAUDE.md

---

## Fase E — Futuro (opcional)

Nada bloqueante. Ir sacando si emerge necesidad.

- [ ] Páginas detalle `/servicios/[slug]` cuando el contenido lo justifique
- [ ] `/casos` + `/casos/[slug]` cuando se publiquen `caseStudy` en Sanity
- [ ] `/proyectos` + `/proyectos/[slug]` en `apps/tech`
- [ ] Blog técnico en `apps/tech` (schema `post`)
- [ ] Rate limit real en `/api/contact` (Upstash o Vercel Edge Config) si aparece spam
- [ ] Turnstile/reCAPTCHA si honeypot + idempotency no bastan
- [ ] Migración npm → pnpm workspaces (un cambio en `packageManager`, solo si compensa)
- [ ] Packages `@ebecerra/ui` y `@ebecerra/utils` cuando emerjan primitivos compartidos

---

## Decisiones abiertas

- **Kickers y números de sección** (`// 01. Servicios`) — ¿Sanity o messages? Tendencia: messages (UI chrome numerada).
- **Revalidate window por contenido** — singletons estables: `revalidate: 86400` (24h). FAQ/contenido editorial: `revalidate: 1800` (30min). Confirmar en A2.
- **Metadata dinámica vs estática** — `generateMetadata` async contra Sanity añade una query por request (ISR mitiga). Aceptable.
