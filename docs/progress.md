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

## 2026-05-13 — Chatbot conversacional con IA en las 3 apps

Recepción virtual con Llama 3.3 70B (Groq) + cadena de fallback de 5 modelos, viva en apps/es, apps/tech y apps/demos. Configuración editorial (greeting, system prompt, disclaimers) en Sanity, editable sin redeploy.

**Arquitectura:**
- `packages/chatbot` nuevo: cliente Groq con fallback inline 429/5xx (`/server`) + componente React mobile-first con streaming SSE (`/client`). Sin `createPortal` para preservar el scope `[data-template="..."]` en demos.
- 3 API routes `/api/chat` en edge runtime. Cada una arma el system prompt: instrucciones base (en código) + reglas del contexto (es / tech / demo) + system prompt editorial (Sanity).
- Schema reutilizable `chatbot` embebido en `profile` (`chatbot` + `chatbotTech` separados para mantener identidades distintas .es/.tech) y en `demoSite`.
- Tokens `--chatbot-*` por contexto (pro, geek, fisio, coach-editorial, coach-vibrant, tandem).

**Decisiones:**
- Cadena de modelos en código (`packages/chatbot/src/server/models.ts`), no env var. Cambia con PR.
- 1 sola `GROQ_API_KEY` compartida en los 3 proyectos de Vercel — Groq limita por cuenta, no por key.
- Profile partido en `chatbot` y `chatbotTech`: greeting/label/title distintos por dominio para reflejar la identidad dual.

**Contenido publicado en Sanity (5 docs, ES+EN, enabled):** profile (apps/es + apps/tech) + 4 demos (equilibrio, marta-solana, claudia-entrena, eco.). System prompts de ~2-3K chars con estructura: quién eres / tono / negocio / servicios y precios / qué hacer / qué NO hacer / redirecciones.

**Aprendizajes operativos:**
- MCP Sanity requiere `workspaceName: "ebecerra-web"` (no `default`).
- Patches de campos nuevos requieren `npx sanity schema deploy --workspace ebecerra-web` antes (necesita `apps/es/sanity.cli.ts`, creado en esta sesión).

Skill `/chatbot-system` documenta el flujo operativo. Commit en `main`: `b868430`.

Pendiente: pegar `GROQ_API_KEY` en los 3 proyectos de Vercel (Production + Preview) antes de que llegue tráfico real.
