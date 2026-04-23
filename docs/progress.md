# Progreso — ebecerra-web

Log de decisiones y sesiones post-archivo del plan original. Las fases activas y checkboxes viven en [`plan.md`](plan.md).

Histórico de la migración Vite → Next + Sanity + monorepo + cutover (Fases 0–9 del plan anterior) en [`archive/progress.md`](archive/progress.md).

Formato: `YYYY-MM-DD — descripción breve`. Entradas más recientes arriba.

---

## 2026-04-23 — Archivo del plan original y reorganización

El plan viejo (`plan-migracion-nextjs-sanity.md`) se archiva junto con su `progress.md` y los CVs de referencia (`cv-pro.md`, `cv-tech.md`) en [`archive/`](archive/). La narrativa del plan viejo (monorepo + dual domain + cutover) está cumplida; el resto de sus ítems (OG images, error pages, `.tech` cutover) se reincorporan como Fases C/D en [`plan.md`](plan.md).

Nuevas prioridades que no existían en el plan viejo:
- Fase A — Sanity editorial completo (mover todo el copy de `messages/*.json` a singletons/colecciones).
- Fase B — Refactor CSS inline (`style={{...}}`) → archivos.

## 2026-04-23 — Auditoría de contenido editable (agent Explore)

Identificados 8 singletons + 2 colecciones a crear en Sanity para cubrir copy que hoy vive en `messages/*.json`: `heroSection`, `siteSettings`, `serviceSectionMeta`, `processSectionMeta`, `casesSectionMeta`, `contactSectionMeta`, `faqPage`, extensión a `profile`; colecciones `faqItem` y `legalPage`. Plan detallado en `plan.md` Fase A.

## 2026-04-23 — Reorganización del catálogo de servicios

`apps/es` pasa de 3 a 4 cards con copy PYME: Web profesional para empezar (900 €), Web que actualizas tú solo (1.500 €), Rescate de tu web actual (2.500 €), Mantenimiento mensual (60 €/mes). Auditoría eliminada del catálogo de pago; se reposiciona como lead magnet gratuito (30 min + mini-informe) en un strip debajo del grid.

Sanity: 3 docs existentes patcheados + 1 nuevo (mantenimiento) publicados. El `description` largo de los 3 patcheados conserva copy antiguo — no se renderiza en home pero habrá que limpiarlo cuando se haga Fase E (páginas detalle).

Meta strip del Hero adaptado a lenguaje PYME (fuera "tech architect", "Magnolia/Java/Spring"): `8 años construyendo webs · Respuesta en 24 h laborables · Webs rápidas y accesibles · Madrid · España`. Keys renombradas: `metaExperience`, `metaResponse`, `metaQuality`, `metaLocation`.

Commits en `main`: `43daf7d` (catálogo + copy), `2fc0e32` (strip lead magnet), `5d4929c` (meta strip hero).
