---
name: content-flow
description: Flujo end-to-end para crear contenido en ebecerra-web (posts, landings, copy de secciones). Úsalo cuando el usuario quiera redactar un post nuevo, planificar contenido, investigar tendencias, buscar de qué hablar, optimizar para SEO/AEO, o duda qué skill de marketing invocar. Orquesta customer-research, tavily-research, content-strategy, copywriting, blog-create-post, ai-seo, seo-aeo-best-practices, seo-audit y social-media-kit en orden, con los solapes entre ellas resueltos.
---

# Flujo de contenido — ebecerra-web

Orquesta varias skills genéricas de marketing/SEO que están instaladas (`/customer-research`, `/tavily-research`, `/content-strategy`, `/copywriting`, `/ai-seo`, `/seo-aeo-best-practices`, `/seo-audit`, `/social-media-kit`) más las del proyecto (`/blog-create-post`, `/blog-system`).

Público objetivo en `apps/es`: **autónomos y dueños de PYMEs en España**, no perfiles técnicos. Mantener vocabulario accesible (ver `/blog-create-post`).

## Orden recomendado

1. **Descubrir de qué hablar** → `/customer-research` (Reddit/G2/foros/reviews/JTBD del público real) y/o `/tavily-research` (reports profundos con citas para tendencias y comparativas de mercado).
2. **Planificar el qué** → `/content-strategy` (traduce hallazgos a pillares, calendario, topic clusters).
3. **Redactar el cómo** → `/copywriting` (titulares, leads, CTAs, claridad, voz) + `/blog-create-post` si es un post (flujo Sanity, marks rough, bilingüe, cover IA).
4. **Optimizar para visibilidad en LLMs** → `/ai-seo` (estructura extractable, three pillars, llms.txt, `/pricing.md`, monitoring de citas en ChatGPT/Perplexity/AI Overviews).
5. **Implementar técnico** → `/seo-aeo-best-practices` (metadata, OG, sitemaps, robots.txt, hreflang, JSON-LD).
6. **Auditar después de publicar** → `/seo-audit` (rankings, Core Web Vitals, indexing, crawl errors).
7. **Repurpose social** → `/social-media-kit` (Instagram/Facebook posts, carousels, stories).

## Solapes y cuándo usar cuál

| Par | Decisión |
|---|---|
| `/customer-research` vs `/content-strategy` | **Research va antes.** Research aporta datos (verbatim quotes, pains, JTBD); strategy planifica calendario y pillares. No duplican: son secuenciales. |
| `/customer-research` vs `/tavily-research` | Research = quotes verbatim de fuentes (Reddit, reviews). Tavily = reports sintetizados con citas (mercado, comparativas). Complementarias. |
| `/copywriting` vs `/blog-create-post` | Copywriting = el **cómo escribir** (cualquier página). Blog-create-post = **flujo operativo** del post (Sanity, marks especiales, bilingüe, cover). Usar ambas para un post. |
| `/ai-seo` vs `/seo-aeo-best-practices` | AI-SEO = estrategia editorial + auditoría de citas en LLMs. SEO-AEO = implementación técnica (metadata, JSON-LD, robots). No duplican: estrategia vs implementación. |
| `/seo-audit` vs los anteriores | Auditoría va **al final** del ciclo, sobre contenido ya publicado. |

## Setup pendiente

- `/tavily-research` requiere CLI: `curl -fsSL https://cli.tavily.com/install.sh | bash && tvly login`. Sin esto la skill falla.

## Casos comunes

- **"Redacta un post sobre X"** → 3 (copywriting + blog-create-post) directamente si el tema ya está decidido. Si no: 1→2→3.
- **"No sé de qué escribir"** → 1 (customer-research enfocado a Reddit subs ES de autónomos/PYMEs) → 2.
- **"Analiza tendencias en X sector"** → tavily-research con `--model pro`.
- **"Optimiza este post para que ChatGPT lo cite"** → 4 (ai-seo) sobre el post existente.
- **"Por qué no rankeo / he perdido tráfico"** → 6 (seo-audit).

## Restricciones del proyecto

- Veracidad: nada de stacks/cifras/clientes inventados en `apps/es`. Fuente: `docs/archive/cv-pro.md` anonimizado.
- Bilingüe ES+EN obligatorio para todo contenido nuevo en Sanity (`localeString`/`localeText`).
- Tono: PYME/autónomo, no perfil técnico. Magnolia/Java fuera de copy visible.
