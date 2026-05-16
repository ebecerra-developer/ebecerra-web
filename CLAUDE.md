# CLAUDE.md — ebecerra-web

## Contexto

Portfolio personal de Enrique Becerra, Tech Architect Lead en VASS y especialista en Magnolia CMS.

**Estado (2026-05-10):** `main` es el **monorepo** en producción con tres apps sobre un único Sanity compartido:

- **[`apps/es`](apps/es/)** → `ebecerra.es` — modo pro, escaparate comercial para autónomos/PYMEs. Home con 6 secciones numeradas: 01 Servicios · 02 Sobre mí · 03 Capacidades (IA, reservas, integraciones, datos) · 04 Cómo trabajamos · 05 Ejemplos · 06 Contacto. 4 servicios en grid 2x2 (Web profesional 900 €, Web editable 1.500 €, Rescate 2.500 €, Mantenimiento 60 €/mes). Sanity wired para services/process/profile/Examples (vía demoSite). Sección Casos retirada en 2026-05-09 (anonimizados, sin valor para el público). Form de contacto con Resend.
- **[`apps/tech`](apps/tech/)** → `ebecerra.tech` — modo geek. Next.js CV-style (8 secciones). Live desde 2026-04-24. El contenido (experience, skills, techTags, projects) viene de Sanity — `apps/tech/lib/content.ts` es solo fallback. Para añadir o editar proyectos, experiencia o skills, hacerlo en Sanity (type `project`, `experience`, `skill`, `techTag`) y publicar; no editar el fallback.
- **[`apps/demos`](apps/demos/)** → `demos.ebecerra.es` — subdominio de demos navegables. Activo desde 2026-05-09. La raíz `/` renderiza la primera demo publicada por `galleryOrder`. Cada demo es un doc `demoSite` en Sanity con `template` + `brandOverrides` (paleta + logo + tono fondo). Robots noindex global. **Cuatro demos publicadas** (última actualización 2026-05-14), cada una con plantilla propia (componentes y tokens propios — no son temas repintados):
  - `/equilibrio` — plantilla `fisio` · clínica fisio anonimizada · cream paper + walnut + petrol blue · bilingüe ES/EN.
  - `/marta-solana` — plantilla `coach-editorial` · coach mujer 35-55 (salud hormonal) · off-white + dusty rose + burdeos cálido + dark warm reservado · magazine spread, Cormorant Garamond italic.
  - `/claudia-entrena` — plantilla `coach-vibrant` · coach generalista marca personal · cremoso + magenta saturado + verde ácido + lila · feed IG protagonista, Space Grotesk black.
  - `/eco` — plantilla `tandem` · agencia de marketing digital "sin humo" para PYMEs/autónomos en Madrid · bilingüe ES/EN.

El "toggle geek mode" original se sustituyó por dominio: cada URL entra en su modo por defecto.

Código legacy del SPA React 19 + Vite archivado en [`_legacy/`](_legacy/). Tags `archive/nextjs-geek-pure` y `archive/migracion-nextjs-mixed` permiten rollback.

**Planificación:**
- Plan activo con checkboxes: [`docs/plan.md`](docs/plan.md).
- Log de decisiones y sesiones: [`docs/progress.md`](docs/progress.md).
- Plan y progreso originales (Fases 0–9, ya cerradas): [`docs/archive/`](docs/archive/).

---

## Stack

- **Monorepo:** npm workspaces + Turborepo 2.x. `packageManager: "npm@10.4.0"`.
- **apps/es, apps/tech, apps/demos:** Next.js 16 + TypeScript + Tailwind v4 + next-intl 4 + Sanity v5. Apps/es además Resend. Las 3 incluyen chatbot con Groq.
- **packages/sanity-schemas:** `@ebecerra/sanity-schemas` — schemas y tipos compartidos (experience, skill, techTag, project, profile, service, processStep, caseStudy, demoSite, locale, chatbot).
- **packages/sanity-client:** `@ebecerra/sanity-client` — cliente + queries GROQ + tipos TS.
- **packages/chatbot:** `@ebecerra/chatbot` — recepción conversacional con IA. Cliente Groq con cadena de 6 modelos de fallback (`/server`) + componente React con streaming SSE (`/client`). Skill `/chatbot-system`.
- **packages/tokens:** `pro.css` (apps/es), `geek.css` (apps/tech). Demos: una hoja por plantilla scopeada con `[data-template="..."]` (`demos-fisio.css`, `demos-coach-editorial.css`, `demos-coach-vibrant.css`, `demos-tandem.css`). Todas incluyen tokens `--chatbot-*`.
- **Sanity `gdtxcn4l` / dataset `production` / workspace `ebecerra-web`** — único, compartido. Studio embebido en `apps/es/app/(misc)/studio/[[...tool]]`. Deploy de schema desde `apps/es` con `npx sanity schema deploy --workspace ebecerra-web` (necesita `apps/es/sanity.cli.ts`). Plan free permite 2 webhooks → patrón de fan-out: `apps/es/api/revalidate` reenvía a `demos.ebecerra.es/api/revalidate` cuando `_type == "demoSite"`.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala workspaces + linkea `@ebecerra/*`. |
| `npm run dev:es` | Dev de `apps/es` (pro). |
| `npm run dev:tech` | Dev de `apps/tech` (geek). |
| `npm run build` | Turborepo orquesta builds paralelos. |
| `npm run lint` / `typecheck` | Todos los workspaces. |

**Dependencias:**
- Específica de una app → `npm install <pkg> -w @ebecerra/es` (o `@ebecerra/tech`).
- De workspace → `"@ebecerra/sanity-client": "*"` en el `package.json` del consumidor.

---

## Políticas de trabajo

Estas son las reglas que aplican a todo cambio en el proyecto. Ante duda, seguirlas por defecto.

### 1. Contenido nuevo siempre en Sanity

Si es copy editorial (títulos, leads, bios, FAQ, info de contacto, metadata, trust badges…), **nace en Sanity** — schema + doc publicado + query con fallback. Nunca solo en `messages/*.json` o hardcoded. El fallback es red de seguridad, no fuente primaria.

UI chrome (labels de formulario, placeholders, estados "Enviando…", aria-labels, separadores, copyright) se queda en `messages/*.json`. Ante duda: ¿el editor querría cambiarlo sin redeploy? Sí → Sanity.

Flujo operativo: skill `/sanity-content-flow`.

### 2. Listas como arrays, no campos nombrados

Si hay N items de la misma forma (trust badges, stats, social links, FAQ items, steps), **un campo `array` en el schema y un `.map()` en React.** Nunca `metaExperience` / `metaResponse` / `metaQuality` paralelos — es deuda que se paga al añadir/reordenar.

### 3. CSS fuera del JSX

No `style={{…}}`. Todo estilo de composición va a un **`*.module.css` co-located** con el componente. Tokens vía `var(--…)` desde `packages/tokens/*.css`. Tailwind v4 disponible pero **no para composición**.

Convenciones: skill `/css-conventions`.

### 4. Bilingüe desde el día uno

Todo string nuevo se escribe **ES + EN en el mismo commit**. En Sanity: `localeString`/`localeText` con ambos campos. En `messages/*.json`: añadir la key a `es.json` y `en.json` antes de usarla (next-intl falla si falta una).

### 5. Fallback obligatorio en queries Sanity

Cada query en `page.tsx` lleva `.catch(() => fallback)`. La home no se cae si Sanity falla o está vacío.

### 6. Verdad del contenido

En `apps/es` (web comercial bajo nombre real): precios, stacks, cifras, clientes **reales o nada**. Fuente: [`docs/archive/cv-pro.md`](docs/archive/cv-pro.md) anonimizado. Clientes siempre anonimizados (sector + tipo de solución, nunca el nombre). Nunca inventar datos concretos.

Lenguaje técnico (Magnolia, Java, Spring, frameworks específicos) **fuera de copy visible al cliente final** — el público de `apps/es` son autónomos/PYMEs, no perfiles tech. Stats anclados a commitments verificables (8+ años, 1:1 trato, 100% código tuyo) en lugar de cifras genéricas tipo "+150 proyectos". `apps/tech` sí puede mencionar stack.

### 7. Mobile-first y nav hamburguesa por defecto

Todo diseño se piensa primero en móvil y luego se enriquece a desktop. Antes de cerrar un componente, verificar layout en ≤480px, ≤768px y ≥1024px.

**Patrón de nav en móvil:**

- Por defecto **hamburger button** que abre un drawer con los enlaces de navegación + el CTA principal dentro.
- El **switcher de idioma** (cuando exista) se queda **fuera** del hamburger, siempre visible — para que se note la capacidad multi-idioma sin abrir el menú.
- En desktop la barra es plana (links inline + CTA + lang).

Aplica tanto a `apps/es`/`apps/tech` como a las plantillas de `apps/demos`.

### 8. Cada demo merece su plantilla — no temas repintados

`apps/demos` vende la idea de "webs a medida". Si dos demos comparten estructura, componentes y paleta familiar (aunque cambien colores), parecen el mismo template repetido y arruinan el argumento comercial. Reglas:

- **Una plantilla por carril visual diferenciado.** No "un coach genérico con paletas distintas" — cada perfil de cliente importante (premium editorial, marca personal, etc.) tiene su propia plantilla con componentes, layouts y tokens propios.
- **Solo se reutiliza lo no protagonista**: lógica de cliente con estado (form de contacto, drawer mobile), tipos compartidos, helpers de imagen. Hero/Services/About/Banner CTA/Footer son siempre propios por plantilla.
- **Tokens** en `packages/tokens/demos-<template>.css`, scopeados con `[data-template="..."]`. Sustituyen tipografía, paleta, scale completa. Nunca dependen unos de otros.
- **Booking, pricing público, IG feed y secciones similares**: opcionales por plantilla. No se incluyen porque "ya están hechas en otra plantilla" — solo si encajan con el avatar real (ej. coach editorial sí publica precios; coach marca personal no, capta por DM).
- **Cuando un drawer/portal usa `createPortal(..., document.body)`**: el portal sale del shell con `data-template` y los tokens scopeados no aplican. Pasa `templateScope` como prop al componente y wrap el portal en un div con ese `data-template`. Patrón aplicado en `FisioNavMobile`.

### 9. Patrón canónico de páginas secundarias (apps/es)

Toda página secundaria de `apps/es` (no-home: Blog, FAQ, Ejemplos, futuras) usa el componente compartido **`<PageHero kicker title lead breadcrumbs? />`** en [`apps/es/components/sections/PageHero.tsx`](apps/es/components/sections/PageHero.tsx). No se crean heroes ad-hoc — si el patrón no cubre tu caso, se cambia el componente, no se inventa uno nuevo para esa página.

- **Kicker**: formato `// PALABRA_CORTA` en UPPERCASE (`// BLOG`, `// FAQ`, `// EJEMPLOS`, `// TAG`…). Una palabra que identifica la sección. Texto descriptivo va al lead, no al kicker.
- **H1**: token `--fs-h2` (32→48px), peso 600, alineado a la izquierda. **No** se usa `--fs-h1` ni `--fs-display` fuera del hero del home.
- **Lead**: clase global `.lead`, max-width 640px. Opcional.
- **Breadcrumbs**: `<Breadcrumbs items={...} />` (lo emite PageHero internamente cuando recibe la prop). Visibles + JSON-LD `BreadcrumbList` autogenerado. **Solo en nivel ≥ 2** (detalle de post, categoría, tag…). En listados de nivel 1 (`/blog`, `/faq`, `/ejemplos`) son ruido — el logo + nav top cubren la orientación.
- **Sub-nav verde claro** (`.subNav` en `Nav.tsx`): solo se renderiza en home. Fuera de home no aparece — los breadcrumbs y la nav top (que ya hace `/#section`) cubren la navegación.

**Listados de contenido** (blog, futuras secciones tipo "casos", "guías"…):

- **Filas (rows), no cards** para el listado principal. Cards se reservan para módulos secundarios (related posts, sliders, mosaicos densos). Patrón en [`apps/es/components/blog/PostRow.tsx`](apps/es/components/blog/PostRow.tsx): texto izquierda + cover derecha en desktop, cover arriba + texto debajo en mobile.
- **Sin sort UI**. Orden cronológico fijo (más recientes primero). El editor decide la prioridad publicando.
- **Filtro por categoría como pills** (server component, links directos a `/blog/categoria/[slug]`), no `<select>`. Patrón en [`apps/es/components/blog/CategoryPills.tsx`](apps/es/components/blog/CategoryPills.tsx).

---

## Permisos y autonomía

- Crear, modificar y eliminar archivos del proyecto.
- Instalar y desinstalar dependencias.
- Hacer commits y push sin confirmar (skill `/git-workflow`).
- Refactorizar dentro del alcance de la tarea.

---

## Lo que NO hacer sin preguntar

- Cambiar la estructura de carpetas raíz del workspace.
- Instalar librerías de UI grandes (MUI, Chakra, etc.).
- Refactorizar secciones no relacionadas con la tarea en curso.
- Modificar `@vercel/analytics` o `@vercel/speed-insights`.
- Tocar routing de `/piezas-game/*` sin validar en preview (skill `/piezas-landing`).
- Desviarse del plan activo sin consultarlo.
- Cambiar el kit de marca (logos, favicons, paleta) — decisión cerrada.

---

## Configuración de correo — ebecerra.es

- **Cuenta principal:** `e.becerra@ebecerra.es` — real, IMAP en Gmail.
- **Aliases en DonDominio** (redirigen a la principal): `contacto@`, `info@`, `legal@`.
- **Notas:** DNS en Vercel (no DonDominio). MX pendiente de configurar. `no-reply@` no existe, solo se usa como remitente.

---

## Env vars de Vercel

Cada app tiene su propio proyecto de Vercel con su set de env vars. Variables compartidas (mismo valor en los 3 proyectos):

- `SANITY_REVALIDATE_SECRET` — secret del webhook de revalidación.
- `GROQ_API_KEY` — chatbot. Una sola key compartida (los rate limits de Groq son por cuenta, no por key — múltiples no escalan).

Específicas de apps/es y apps/tech:

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL` — form de contacto.

Para rotar la key de Groq: cambiarla en los 3 proyectos. No hay Team Environment Variables (cuenta free).

---

## Skills

Invocar con `/nombre`. Organizadas por cuándo usarlas.

### Específicas de este proyecto

| Skill | Cuándo |
|---|---|
| `/git-workflow` | Commits y push (workaround heredoc, convenciones). |
| `/sanity-content-flow` | Crear/editar/publicar contenido en Sanity, modificar schemas, patchear vía MCP. |
| `/blog-create-post` | Redactar y publicar un post nuevo del blog: tono PYME, estructura, marks rough, bilingüe, cover IA + validación. |
| `/chatbot-system` | Editar greetings/system prompts del chatbot, tocar la cadena de modelos Groq, añadir contexto nuevo o diagnosticar. |
| `/demos-template-system` | Añadir una plantilla nueva a `apps/demos` (dental, asesoría…). Estructura, qué reutilizar, gotcha de createPortal. |
| `/css-conventions` | Escribir o portar estilos. CSS Modules co-located. |
| `/design-tokens` | Paleta, tokens CSS, rough-notation, handoff de Claude Design. |
| `/brand-identity` | Logos, favicons, OG images, kit de marca. |
| `/deployment-sanity-webhook` | Vercel, dominios, env vars, webhooks Sanity, CORS. |
| `/i18n-next-intl` | Añadir strings traducibles, routing por locale, metadata bilingüe. |
| `/piezas-landing` | Editar `public/piezas-game/` o su routing. |
| `/legacy-vite-codebase` | Consultar convenciones del SPA archivado en `_legacy/`. |

### Genéricas de uso habitual

| Skill | Uso |
|---|---|
| `/simplify` | Revisar código cambiado por calidad y reuso. |
| `/next-best-practices` | Código Next.js App Router (RSC, Server Actions, routing). |
| `/next-cache-components` | Caching, ISR, revalidación. |
| `/vercel-react-best-practices` | Patrones React 19 (Suspense, hooks, transiciones). |
| `/sanity-best-practices` | Schemas, GROQ, TypeGen, Presentation. |
| `/content-modeling-best-practices` | Referenciar vs embeber, naming, i18n en Sanity. |
| `/seo-aeo-best-practices` | Metadata, schema.org, AEO. |
| `/seo-audit` | Auditoría SEO on-page. |
| `/resend` | Email transaccional (gotchas de idempotency, templates). |
| `/deploy-to-vercel` | Deploy, env vars, dominios en Vercel. |
| `/typescript-advanced-types` | Genéricos, utility types, inferencia. |
| `/frontend-design` | Diseño de componentes o layouts. |
| `/web-design-guidelines` | Revisar UI contra guidelines de accesibilidad y UX. |
| `/content-strategy` | Planificar copy de servicios, casos, CTAs. |

Añadir más skills: `npx skills add <owner/repo@skill> -y` dentro del proyecto.
