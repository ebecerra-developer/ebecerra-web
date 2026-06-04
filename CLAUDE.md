# CLAUDE.md — ebecerra-web

## Contexto

Portfolio personal de Enrique Becerra (Tech Architect Lead en VASS, especialista Magnolia CMS). Monorepo en producción con tres apps sobre Sanity compartido `gdtxcn4l` (workspace `ebecerra-web`, no `default`):

- **[`apps/es`](apps/es/)** → `ebecerra.es` — modo pro, comercial para autónomos/PYMEs. Home con 6 secciones numeradas: 01 Servicios · 02 Sobre mí · 03 Capacidades (IA, reservas, integraciones, datos) · 04 Cómo trabajamos · 05 Ejemplos · 06 Contacto. Sección Servicios reescrita 2026-05-17 (singleton `servicesPricing`): **dos caminos × tres tiers** — Contrato (Esencial 399 € + 49 €/mes · Profesional 699 € + 69 €/mes · Avanzado 999 € + 89 €/mes, permanencia 12m) y Pago único (900 / 1.500 / 2.000 €) + add-ons (chatbot 49 € + 9 €/mes, reservas 199 €), cláusula de rescisión y footnote de migración (15 €/página, 25 €/blog entry). Form de contacto con Resend. **Blog vivo desde 2026-05-15** (`/blog`).
- **[`apps/tech`](apps/tech/)** → `ebecerra.tech` — modo geek, CV-style. Live desde 2026-04-24. Contenido desde Sanity, `lib/content.ts` solo fallback (añadir/editar `project`, `experience`, `skill`, `techTag` en Sanity, no en el fallback).
- **[`apps/demos`](apps/demos/)** → `demos.ebecerra.es` — 4 demos publicadas (`fisio`, `coach-editorial`, `coach-vibrant`, `tandem`), plantilla propia cada una. Robots noindex global. Paletas y detalle por demo en memoria [project_demos_architecture](memory:project_demos_architecture).

Legacy SPA React+Vite en [`_legacy/`](_legacy/). Tags `archive/nextjs-geek-pure` y `archive/migracion-nextjs-mixed` para rollback.

**Planificación:** [`docs/plan.md`](docs/plan.md) (activo) · [`docs/progress.md`](docs/progress.md) (decisiones) · [`docs/archive/`](docs/archive/) (Fases 0–9 cerradas).

---

## Stack

Monorepo npm workspaces + Turborepo 2.x (`packageManager: npm@10.4.0`). Las 3 apps: Next.js 16 + TS + Tailwind v4 + next-intl 4 + Sanity v5 + chatbot Groq. `apps/es` además Resend.

Packages internos: `@ebecerra/sanity-schemas`, `@ebecerra/sanity-client`, `@ebecerra/chatbot`, `@ebecerra/chatbot-saas`, `@ebecerra/chatbot-admin-ui`, `@ebecerra/sanity-chatbot-schema`, `@ebecerra/tokens` (una hoja por modo/plantilla, scopeada con `[data-template="..."]` en demos).

Studio embebido en `apps/es/app/(misc)/studio/[[...tool]]`. Deploy schema desde `apps/es`: `npx sanity schema deploy --workspace ebecerra-web` (necesita `apps/es/sanity.cli.ts`). Webhooks limitados a 2 (plan free) → `apps/es/api/revalidate` reenvía a `demos.ebecerra.es/api/revalidate` cuando `_type == "demoSite"` Y dispara `handleSyncWebhook` del chatbot SaaS internamente cuando el doc es chatbot-relevante (profile/demoSite/chatbotConfig). Cero webhooks dedicados al sync de chatbot.

**Chatbot multi-tenant SaaS desde 2026-05-21**: backend centralizado en `apps/es` servido en `chats.ebecerra.es`. 7 tenants activos (apps-es, apps-tech, 4 demos, llaullau). Cada web cliente solo proxea con su `CHATBOT_TENANT_KEY`. Ver `/chatbot-system`.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala workspaces + linkea `@ebecerra/*`. |
| `npm run dev:es` | Dev de `apps/es`. |
| `npm run dev:tech` | Dev de `apps/tech`. |
| `npm run build` | Turborepo orquesta builds paralelos. |
| `npm run lint` / `typecheck` | Todos los workspaces. |

**Dependencias:** específicas → `npm install <pkg> -w @ebecerra/es`. De workspace → `"@ebecerra/sanity-client": "*"` en el `package.json` del consumidor.

---

## Políticas de trabajo

Ante duda, seguirlas por defecto.

1. **Contenido nuevo en Sanity.** Copy editorial (títulos, leads, FAQ, metadata, trust badges) nace en Sanity con fallback. UI chrome (labels form, placeholders, "Enviando…", aria-labels, copyright) en `messages/*.json`. Ante duda: ¿el editor querría cambiarlo sin redeploy? Sí → Sanity. Flujo: `/sanity-content-flow`.
2. **Listas como arrays, no campos nombrados.** N items de la misma forma → `array` schema + `.map()`. Nunca `metaExperience` / `metaResponse` / `metaQuality` paralelos.
3. **CSS fuera del JSX.** No `style={{…}}`. Todo a `*.module.css` co-located. Tokens vía `var(--…)` desde `packages/tokens/*.css`. Tailwind v4 disponible pero **no** para composición. Ver `/css-conventions`.
4. **Bilingüe desde el día uno.** ES + EN en el mismo commit. En Sanity: `localeString`/`localeText` con ambos campos. En `messages/*.json`: añadir la key a `es.json` y `en.json` antes de usarla (next-intl falla si falta una).
5. **Fallback obligatorio en queries Sanity.** Cada query en `page.tsx` lleva `.catch(() => fallback)`. La home no se cae si Sanity falla o está vacío.
6. **Verdad del contenido.** En `apps/es`: precios, stacks, cifras, clientes **reales o nada**. Clientes anonimizados (sector + tipo, nunca el nombre). Magnolia/Java/Spring fuera de copy visible — público son autónomos/PYMEs, no perfiles tech. Stats anclados a commitments verificables (8+ años, 1:1 trato, 100% código tuyo) en lugar de cifras tipo "+150 proyectos". `apps/tech` sí menciona stack. Fuente: [`docs/archive/cv-pro.md`](docs/archive/cv-pro.md).
7. **Mobile-first y nav hamburguesa.** Diseñar primero ≤480px, validar también ≤768px y ≥1024px. En móvil: hamburger drawer con nav links + CTA dentro, switcher de idioma **fuera** del hamburger (siempre visible). En desktop: barra plana. Aplica a `apps/es`, `apps/tech` y plantillas de `apps/demos`.
8. **Cada demo merece su plantilla — no temas repintados.** Hero/Services/About/Footer son propios por plantilla; solo se reutiliza lo no protagonista (form contacto, drawer mobile, tipos, helpers de imagen). Tokens scopeados con `[data-template="..."]`. Detalles, reglas de booking/pricing/IG opcionales y gotcha de `createPortal` en `/demos-template-system`.
9. **Páginas secundarias usan PageHero compartido.** Reglas de kicker/H1/breadcrumbs + patrones de listado (rows no cards, sin sort UI, pills de categorías) en `/page-patterns`.

---

## Permisos y autonomía

- Crear, modificar y eliminar archivos del proyecto.
- Instalar y desinstalar dependencias.
- Hacer commits y push sin confirmar (`/git-workflow`).
- Refactorizar dentro del alcance de la tarea.

## Lo que NO hacer sin preguntar

- Cambiar la estructura de carpetas raíz del workspace.
- Instalar librerías de UI grandes (MUI, Chakra, etc.).
- Refactorizar secciones no relacionadas con la tarea en curso.
- Modificar `@vercel/analytics` o `@vercel/speed-insights`.
- Tocar routing de `/piezas-game/*` sin validar en preview (`/piezas-landing`).
- Desviarse del plan activo sin consultarlo.
- Cambiar el kit de marca (logos, favicons, paleta) — decisión cerrada.

Config de correo y env vars de Vercel: ver memorias `reference_email_config` y `reference_vercel_env_vars`.

---

## Skills

Invocar con `/nombre`. Para crear contenido (post, copy, SEO, AEO) entra por **`/content-flow`** — orquesta las skills de marketing en orden y resuelve solapes.

### Específicas del proyecto

| Skill | Cuándo |
|---|---|
| `/git-workflow` | Commits y push (workaround heredoc). |
| `/sanity-content-flow` | Crear/editar/publicar en Sanity, modificar schemas, patchear vía MCP. |
| `/blog-system` | Arquitectura del blog: schemas, queries, layout ToC, Shiki, likes+comments Supabase. |
| `/blog-create-post` | Redactar y publicar un post (tono PYME, marks rough, bilingüe, cover IA + validación). |
| `/content-flow` | Orquesta investigación → estrategia → redacción → AI-SEO → SEO técnico → auditoría → social. |
| `/page-patterns` | Páginas secundarias en apps/es (PageHero, listados, breadcrumbs, sub-nav). |
| `/local-seo` | SEO local: Google Business Profile, Bing/Apple listados, reseñas, NAP, páginas de zona (`/diseno-web-[ciudad]`), aviso anti-EMD/doorway. |
| `/chatbot-system` | Greetings/system prompts, cadena Groq, añadir contexto o diagnosticar. |
| `/admin-panel` | Añadir módulo, provisionar admin de cliente nuevo, mapear tokens al admin, depurar estética. |
| `/demos-template-system` | Añadir plantilla nueva a `apps/demos`. |
| `/css-conventions` | Estilos: CSS Modules co-located. |
| `/design-tokens` | Paleta, tokens, rough-notation, handoff Claude Design. |
| `/brand-identity` | Logos, favicons, OG images. |
| `/deployment-sanity-webhook` | Vercel, dominios, env vars, webhooks Sanity, CORS. |
| `/i18n-next-intl` | Strings traducibles, routing por locale, metadata bilingüe. |
| `/piezas-landing` | `public/piezas-game/` y su routing. |
| `/legacy-vite-codebase` | Convenciones del SPA archivado en `_legacy/`. |

### Genéricas

- **Contenido / marketing / SEO** (orquestadas por `/content-flow`): `/customer-research`, `/tavily-research`, `/content-strategy`, `/copywriting`, `/ai-seo`, `/seo-aeo-best-practices`, `/seo-audit`, `/social-media-kit`. Tavily requiere CLI: `curl -fsSL https://cli.tavily.com/install.sh | bash && tvly login`.
- **Sanity:** `/sanity-best-practices`, `/content-modeling-best-practices`.
- **Next / React / TS:** `/next-best-practices`, `/next-cache-components`, `/vercel-react-best-practices`, `/typescript-advanced-types`.
- **Diseño / UI:** `/frontend-design`, `/web-design-guidelines`, `/canvas-design` (piezas estáticas `.pdf`/`.png` — presupuestos, propuestas, posters, one-pagers — aplicando filosofía editorial explícita; valida con `presupuesto-brunette-agency.pdf`).
- **Infra y misc:** `/resend`, `/deploy-to-vercel`, `/simplify`.

Añadir más: `npx skills add <owner/repo@skill> -g -y` (global) o sin `-g` para el proyecto.

---

## Agentes (subagentes de revisión y arquitectura)

Subagentes en [.claude/agents/](.claude/agents/). **No son roles con los que se chatea** — el agente principal los **delega** para una tarea concreta y se queda con la conclusión. Tienen menos contexto que el principal (eso es una ventaja para revisar: ojos frescos e independientes). Los **testers son read-only por contrato**.

### Testers — al cerrar una tarea

Cuando el principal dé algo por terminado y verificado por sí mismo, lanza los testers que apliquen **antes de considerarlo cerrado**. Si un tester devuelve hallazgos, iterar y volver a pasar. Mapa por tipo de entrega:

| Terminas… | Lanza |
|---|---|
| Post / pieza de IG/FB | `tester-copy` + `tester-visual-social` |
| Desarrollo web / plantilla / demo / página pública | `tester-visual-web` + `tester-dev` + `tester-seo-a11y` |
| Herramienta / feature con lógica | `tester-dev` + `/code-review high` (rendimiento/calidad) + `/security-review` (seguridad) |
| Copy de una sección / landing | `tester-copy` (+ `tester-visual-web` si afecta al layout) |

Los independientes se lanzan **en paralelo** (varias llamadas Agent en un mismo mensaje).

### Arquitectos — antes de desarrollar, no después

`arquitecto-escalabilidad`, `arquitecto-robustez`, `arquitecto-mantenibilidad`, `arquitecto-seguridad`. Invocar **solo en decisiones complejas de arquitectura o herramientas nuevas**, en paralelo, para:

- **obtener ideas** desde lentes distintas, o
- **contrastar como test** una arquitectura ya pensada antes de implementarla.

**Nunca seguirlos a ciegas.** Son perspectivas a sintetizar — el principal decide, con su contexto del monorepo. Para revisar seguridad/rendimiento de código **ya escrito** (no diseño) usar `/security-review` y `/code-review`, no los arquitectos.

### Contenido social: ideas + producción en paralelo

`buscador-ideas-social` es un **scout de ideas**: rastrea fuentes externas (web/Tavily/tendencias/competencia) e internas (posts ya publicados, calendario de Notion, blog) y devuelve una lista distilada de ideas. No crea piezas ni inventa datos; su valor es aislar el ruido de la investigación fuera del hilo principal.

`disenador-social` produce **una** pieza terminada siguiendo `/social-media-kit` + memoria. Su único valor es **paralelizar**.

Flujo de "planifícame la semana": el principal lanza `buscador-ideas-social` para traer ideas → el user filtra/aprueba → el principal lanza N `disenador-social` en paralelo (uno por idea) → verifica → pasa cada pieza por `tester-copy` + `tester-visual-social` → reinyecta hallazgos al diseñador. Ninguno es un "agente de redes" general (eso lo cubren las skills + el principal): son un scout de investigación y un ejecutor paralelo de diseño.

### Mejora continua de los agentes

El **agente principal es el único que edita** los `.md` de `.claude/agents/`. Cuando observe (o un subagente le reporte) que la definición de un agente lleva a resultados mejorables — se le escapa una clase de fallo, da falsos positivos, o su salida es poco útil — el principal **corrige ese `.md`** de forma quirúrgica y deja constancia del cambio. Los subagentes **no se auto-editan**: los testers son read-only y un único escritor evita carreras cuando corren en paralelo. Cada agente puede cerrar su reporte con una sección «Mejora sugerida de mi definición» que el principal valora y aplica.
