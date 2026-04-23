# Plan de trabajo — ebecerra-web

**Estado actual (2026-04-23):** `main` es el monorepo en producción sirviendo `apps/es` en [ebecerra.es](https://ebecerra.es). `apps/tech` completa en el repo, sin cutover DNS. Sanity `gdtxcn4l/production` alimenta services/process/profile; el resto del copy vive en `messages/*.json`.

**Tracking:** checkboxes `[ ]` / `[x]` inline en este archivo. Decisiones dateadas y bloqueos en [`progress.md`](progress.md). Plan y progreso originales (Fases 0–9: migración Vite → Next + Sanity + monorepo + cutover) archivados en [`archive/`](archive/).

---

## Fase A — Sanity editorial completo

**Objetivo:** mover todo el copy comercial editable a Sanity. Dejar en `messages/*.json` solo UI chrome (labels de formulario, estados, aria-labels, separadores, copyright format).

**Frontera:** si el editor querría cambiarlo sin redeploy → Sanity. Si es chrome que cambia con código → messages.

### A1 — Schemas base

- [ ] `heroSection` singleton: kicker, title (con markup `[circle]`), lead, ctaPrimary, ctaSecondary, trustBadges[]
- [ ] `siteSettings` singleton: metadata (title, descriptions, OG, Twitter, keywords), footerTagline, availability, email, linkedinUrl, location, responseTime, socialLinks[]
- [ ] `serviceSectionMeta`, `processSectionMeta`, `casesSectionMeta`, `contactSectionMeta` singletons (kicker, title, lead + auditStrip en services)
- [ ] Extender `profile` con `bio1`, `bio2`, `stats[]` (label, value)
- [ ] `faqPage` singleton (metaTitle, metaDescription, title, lead, contactSectionTitle, contactSectionLead) + `faqItem` colección (question, answer, order, category)
- [ ] `legalPage` colección: slug, title, metaDescription, content (localePortableText)
- [ ] Deploy: `npx sanity schema deploy` desde Studio embebido

### A2 — Quick wins (ROI alto)

- [ ] Queries en `packages/sanity-client/queries.ts` con fallback seguro por query (`.catch(() => null)`)
- [ ] Hero lee de `heroSection`
- [ ] Metadata OG desde `siteSettings.metadata` en `generateMetadata`
- [ ] Contact info (email, LinkedIn, location, SLA) desde `siteSettings`

### A3 — Secciones de home

- [ ] Services title/lead/audit strip desde `serviceSectionMeta`
- [ ] Process title/lead desde `processSectionMeta`
- [ ] Cases title/lead desde `casesSectionMeta`
- [ ] About bio + stats desde `profile` extendido
- [ ] Contact section header desde `contactSectionMeta`
- [ ] Footer tagline + availability desde `siteSettings`

### A4 — FAQ y legales

- [ ] FAQ headers desde `faqPage`
- [ ] FAQ items desde colección `faqItem` ordenados por `order`
- [ ] Ruta dinámica `/[slug]` para legal pages bajo `app/(locale)/[locale]/`
- [ ] Migrar privacy content existente a `legalPage` con slug `privacidad` (+ EN)
- [ ] Borrar PrivacyEs/En hardcodeados una vez validado

### A5 — Structured Data dinámico

- [ ] JSON-LD (Person, Organization, WebSite, Service) alimentado desde `siteSettings`
- [ ] Verificar con Google Rich Results Test
- [ ] Extraer `Service` schema del JSON-LD desde docs `service` publicados

**Riesgo principal:** Sanity down → cada sección debe degradar al fallback local de `messages/*.json` sin romper la home.

---

## Fase B — Refactor CSS inline → archivos

**Objetivo:** eliminar `style={{...}}` de los componentes.

### B1 — Decisión de estrategia (bloqueante)

- [ ] Elegir: **CSS modules** (`.module.css` co-located con cada componente) vs **Tailwind utilities** (usar `bg-cta text-text-secondary` ya mapeadas en `globals.css` vía `@theme inline`)
- [ ] Establecer convenciones: dónde va, naming, breakpoints

### B2 — Refactor por componente

Orden recomendado: empezar por los grandes (Hero, Services) para validar la convención antes de propagarla.

- [ ] `Nav.tsx`
- [ ] `Hero.tsx`
- [ ] `Services.tsx` (incluye audit strip)
- [ ] `Case.tsx`
- [ ] `About.tsx`
- [ ] `Process.tsx`
- [ ] `Contact.tsx`
- [ ] `Footer.tsx`
- [ ] FAQ components (cuando los haya)
- [ ] Legal page components (cuando se migren a Sanity)

**Orden con Fase A:** B va después de A. Ambas tocan los mismos archivos de componentes; secuencial evita reescribir dos veces.

---

## Fase C — Pulido pendiente del plan anterior

Ítems que quedaban sueltos antes de archivar el plan original.

- [ ] `error.tsx` + `not-found.tsx` en `apps/es` con copy pro (solo existe `global-error.tsx`)
- [ ] OG images dinámicas con `@vercel/og` (ni `api/og` ni `opengraph-image.tsx`)
- [ ] Auditoría Lighthouse ≥ 90 en Perf/A11y/Best/SEO contra `ebecerra.es` prod
- [ ] Verificar CORS Sanity con dominios prod
- [ ] Verificar webhook de Sanity revalidando `/` y `/en` tras publish real

---

## Fase D — Cutover `ebecerra.tech`

No urgente. Hacer cuando `apps/tech` tenga contenido técnico listo para publicar y se quiera activar marca técnica.

- [ ] Proyecto Vercel 2 apuntando a `apps/tech` (Root Directory) con `turbo-ignore`
- [ ] Env vars replicadas (Sanity project/dataset, `SANITY_REVALIDATE_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`)
- [ ] Dominio `ebecerra.tech` + `www.ebecerra.tech` asignados al proyecto Vercel 2
- [ ] CORS Sanity con los 4 dominios (es/tech + www)
- [ ] Webhook adicional Sanity → `https://ebecerra.tech/api/revalidate`
- [ ] SSL verificado
- [ ] Easter eggs del SPA original reactivados en Hero (terminal)
- [ ] Comunicación pública (LinkedIn tech)

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

- **Estrategia CSS para Fase B** — modules vs Tailwind utilities (bloqueo B1).
- **Kickers y números de sección** (`// 01. Servicios`) — ¿Sanity o messages? Tendencia: messages (UI chrome numerada).
- **Revalidate window por contenido** — singletons estables: `revalidate: 86400` (24h). FAQ/contenido editorial: `revalidate: 1800` (30min). Confirmar en A2.
- **Metadata dinámica vs estática** — `generateMetadata` async contra Sanity añade una query por request (ISR mitiga). Aceptable.
