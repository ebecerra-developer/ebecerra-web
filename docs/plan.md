# Plan de trabajo — ebecerra-web

**Estado actual (2026-04-23):** `main` es el monorepo en producción sirviendo `apps/es` en [ebecerra.es](https://ebecerra.es). `apps/tech` completa en el repo, sin cutover DNS. Sanity `gdtxcn4l/production` alimenta services/process/profile; el resto del copy vive en `messages/*.json`.

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

## Fase F — Demos para clientes (`demos.ebecerra.es`)

**Objetivo:** webs de ejemplo navegables (clínica fisio, dental, abogados, coach…) para enseñar a clientes potenciales lo que pueden tener. Cada demo accesible por URL propia, editable desde Sanity con interfaz simple, e imágenes vía Unsplash. Primera demo: fisio bilingüe ES/EN para enseñar a una amiga fisioterapeuta con web actual en WordPress.

**Decisiones (2026-05-09):**

- **App separada `apps/demos`** servida en subdominio `demos.ebecerra.es`. Aislamiento total de blast radius y bundle. Reusa `@ebecerra/sanity-client`, `@ebecerra/sanity-schemas` y `@ebecerra/tokens`.
- **Schema único `demoSite`** con campo `template` (select) que dispara una plantilla React distinta. Schema en `packages/sanity-schemas`.
- **Imágenes:** `sanity-plugin-asset-source-unsplash` en el Studio embebido de `apps/es`. Editor busca dentro de Sanity, asset queda en CDN Sanity con pipeline.
- **Studio:** custom structure que destaca "Demos" como sección top-level. Presentation activado para split-view de edición en vivo.
- **SEO:**
  - Demos individuales `demos.ebecerra.es/{locale}/{slug}` → `noindex`.
  - Galería pública `ebecerra.es/ejemplos` (en `apps/es`, no en `apps/demos`) → indexada, contenido editorial valioso ("ejemplos de webs para autónomos"), enlaza a las demos. Su SEO suma a `ebecerra.es`.
- **i18n:** todos los campos de copy son `localeString`/`localeText` desde el inicio. Las demos monolingües dejan EN vacío y caen al fallback ES. Primera demo (fisio) bilingüe.
- **DNS:** registro CNAME `demos` → `cname.vercel-dns.com` en panel DonDominio (DNS de ebecerra.es está en DonDominio, no en Vercel — corregir mención obsoleta en CLAUDE.md).
- **Acceso de cliente:** prioridad demos guiadas. Invitación de usuarios viewer/editor a Sanity (plan free permite 3) queda como capacidad opcional, no bloqueante.

### F1 — Scaffold del subdominio

- [ ] Crear `apps/demos` (Next.js 16 + TS + Tailwind v4 + next-intl 4) copiando estructura mínima de `apps/es`
- [ ] Wiring de `@ebecerra/sanity-client`, `@ebecerra/sanity-schemas`, `@ebecerra/tokens`
- [ ] Layout raíz, `not-found.tsx`, `error.tsx`, robots con noindex global por defecto
- [ ] Crear proyecto Vercel `ebecerra-demos` (root `apps/demos`, turbo-ignore)
- [ ] Añadir dominio `demos.ebecerra.es` en Vercel + CNAME en DonDominio
- [ ] Replicar env vars (Sanity project/dataset/token, Resend si aplica)
- [ ] Añadir `https://demos.ebecerra.es` a CORS de Sanity
- [ ] Smoke test: deploy "hello world" en el subdominio, SSL OK
- [ ] Webhook adicional Sanity → `https://demos.ebecerra.es/api/revalidate/`

### F2 — Schema `demoSite` + plugin Unsplash

- [ ] Añadir schema `demoSite` a `packages/sanity-schemas`: slug, template (select), name, tagline, hero, about, services[], team[], testimonials[], contact, seo, enableEnglish
- [ ] Campos de copy como `localeString`/`localeText`
- [ ] Instalar `sanity-plugin-asset-source-unsplash` en `apps/es/sanity.config.ts`
- [ ] Custom structure: sección top-level "Demos" listando documentos `demoSite`
- [ ] Activar Presentation tool para `demoSite` apuntando a `demos.ebecerra.es/{locale}/{slug}`
- [ ] Deploy schema (`npx sanity schema deploy`)
- [ ] Crear doc vacío de prueba para validar que aparece en Studio

### F3 — Plantilla "fisio" + demo Elena bilingüe

- [ ] Definir paleta y tipografía propias del template fisio (cálida, sanitaria, distinta de la pro). Tokens en `packages/tokens/demos-fisio.css` o equivalente
- [ ] Componentes de secciones: `<HeroFisio>`, `<AboutFisio>`, `<ServicesFisio>`, `<TeamFisio>`, `<TestimonialsFisio>`, `<ContactFisio>`, `<FooterFisio>`
- [ ] Página `app/[locale]/[slug]/page.tsx` con switch por `template` (caso `fisio` por ahora)
- [ ] Banner sutil "Demo / Ejemplo de web — no es un negocio real"
- [ ] Crear documento real de Elena en Sanity con copy ES + EN + imágenes Unsplash
- [ ] Switcher de idioma ES/EN funcional (condicionado por `enableEnglish`)
- [ ] Validar mobile, Lighthouse, switcher

### F4 — Galería pública en `apps/es`

- [ ] Schema `demosGallery` (singleton) con title, lead, intro
- [ ] Página `app/(locale)/[locale]/ejemplos/page.tsx` listando demos publicadas
- [ ] Cada tarjeta: captura, nombre, sector, CTA "Ver demo" → `demos.ebecerra.es/{locale}/{slug}`
- [ ] Indexable. Metadata + JSON-LD (`ItemList` o similar)
- [ ] Enlace desde nav o footer de la web pro

### F5 — Presentation tool / Visual Editing (opcional, postcutover)

Una vez `demos.ebecerra.es` esté en producción, activar split-view de edición en
vivo desde el Studio embebido en `apps/es`. Argumento de venta frente a WordPress:
el cliente edita en una columna y ve el cambio aplicado en la otra.

- [ ] `presentationTool({ previewUrl, allowOrigins })` en `apps/es/sanity.config.ts` con `previewUrl.initial = 'https://demos.ebecerra.es'` y `allowOrigins` incluyendo `demos.ebecerra.es` + `localhost`
- [ ] Route handler `apps/demos/app/api/draft-mode/enable/route.ts` validando secret y llamando `draftMode().enable()`
- [ ] `<VisualEditing />` en layout cuando `draftMode().isEnabled`
- [ ] Switch a `next-sanity`'s `sanityFetch` con `stega: true` para overlays click-to-edit
- [ ] Resolver de URL de preview a partir del documento (slug → `/{locale}/{slug}`)

### F6 — Plantillas adicionales (rolling)

Sacar conforme haga falta. Cada plantilla es una sesión propia.

- [ ] Plantilla `dental`
- [ ] Plantilla `legal` (despacho de abogados)
- [ ] Plantilla `coach` (entrenador personal)
- [ ] Plantilla `asesoria`
- [ ] Plantilla `restaurante`

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
