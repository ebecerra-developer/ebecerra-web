# CLAUDE.md — ebecerra-web

## Contexto

Portfolio personal de Enrique Becerra, Tech Architect Lead en VASS y especialista en Magnolia CMS.

**Estado (2026-05-09):** `main` es el **monorepo** en producción con tres apps sobre un único Sanity compartido:

- **[`apps/es`](apps/es/)** → `ebecerra.es` — modo pro, escaparate comercial para autónomos/PYMEs. Home con 6 secciones numeradas: 01 Servicios · 02 Sobre mí · 03 Capacidades (IA, reservas, integraciones, datos) · 04 Cómo trabajamos · 05 Ejemplos · 06 Contacto. 4 servicios en grid 2x2 (Web profesional 900 €, Web editable 1.500 €, Rescate 2.500 €, Mantenimiento 60 €/mes). Sanity wired para services/process/profile/Examples (vía demoSite). Sección Casos retirada en 2026-05-09 (anonimizados, sin valor para el público). Form de contacto con Resend.
- **[`apps/tech`](apps/tech/)** → `ebecerra.tech` — modo geek. Next.js CV-style (8 secciones). Live desde 2026-04-24. El contenido (experience, skills, techTags, projects) viene de Sanity — `apps/tech/lib/content.ts` es solo fallback. Para añadir o editar proyectos, experiencia o skills, hacerlo en Sanity (type `project`, `experience`, `skill`, `techTag`) y publicar; no editar el fallback.
- **[`apps/demos`](apps/demos/)** → `demos.ebecerra.es` — subdominio de demos navegables para enseñar a clientes potenciales. Activo desde 2026-05-09. La raíz `/` renderiza la primera demo publicada (actualmente `equilibrio` — clínica fisio anonimizada). Cada demo es un doc `demoSite` en Sanity con `template` + `brandOverrides` (paleta y logo personalizables sin tocar código). Plantilla actual: `fisio` (paleta madera + petrol blue). Robots noindex global (header HTTP + meta).

El "toggle geek mode" original se sustituyó por dominio: cada URL entra en su modo por defecto.

Código legacy del SPA React 19 + Vite archivado en [`_legacy/`](_legacy/). Tags `archive/nextjs-geek-pure` y `archive/migracion-nextjs-mixed` permiten rollback.

**Planificación:**
- Plan activo con checkboxes: [`docs/plan.md`](docs/plan.md).
- Log de decisiones y sesiones: [`docs/progress.md`](docs/progress.md).
- Plan y progreso originales (Fases 0–9, ya cerradas): [`docs/archive/`](docs/archive/).

---

## Stack

- **Monorepo:** npm workspaces + Turborepo 2.x. `packageManager: "npm@10.4.0"`.
- **apps/es, apps/tech, apps/demos:** Next.js 16 + TypeScript + Tailwind v4 + next-intl 4 + Sanity v5. Apps/es además Resend.
- **packages/sanity-schemas:** `@ebecerra/sanity-schemas` — schemas y tipos compartidos (experience, skill, techTag, project, profile, service, processStep, caseStudy, demoSite, locale).
- **packages/sanity-client:** `@ebecerra/sanity-client` — cliente + queries GROQ + tipos TS.
- **packages/tokens:** `pro.css` (apps/es), `geek.css` (apps/tech), `demos-fisio.css` (apps/demos plantilla fisio).
- **Sanity `gdtxcn4l` / dataset `production`** — único, compartido. Studio embebido en `apps/es/app/(misc)/studio/[[...tool]]`. Plan free permite 2 webhooks → patrón de fan-out: `apps/es/api/revalidate` reenvía a `demos.ebecerra.es/api/revalidate` cuando `_type == "demoSite"`.

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

## Skills

Invocar con `/nombre`. Organizadas por cuándo usarlas.

### Específicas de este proyecto

| Skill | Cuándo |
|---|---|
| `/git-workflow` | Commits y push (workaround heredoc, convenciones). |
| `/sanity-content-flow` | Crear/editar/publicar contenido en Sanity, modificar schemas, patchear vía MCP. |
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
