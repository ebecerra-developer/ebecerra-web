# Tarea: landing de captación SEO `/diseno-web-madrid` en `apps/es`

> Brief para ejecutar en una sesión dedicada. Lee también `apps/es/CLAUDE.md`
> y las skills referenciadas antes de empezar. Trabaja en `apps/es`.

## Objetivo
Crear una **página de captación local** en ebecerra.es orientada a la búsqueda
**"diseño web Madrid"** (y variantes: "diseñador web Madrid", "página web autónomos
Madrid"), para empezar a aparecer en orgánico para esa intención **sin** convertir
la marca en "solo Madrid".

## Contexto estratégico (decisiones YA tomadas — no re-discutir)
- Enrique trabaja para **autónomos y pymes de toda España en remoto**; está basado
  en **Madrid (Moratalaz)**. El posicionamiento de marca es **nacional**.
- Se descartó comprar un dominio aparte tipo `diseñowebmadrid.es` (EMD): desde la
  actualización EMD de Google ya no da ventaja, los enlaces de dominios propios no
  pasan valor, y una web-señuelo que redirige es **doorway page** (penalizable).
- La jugada elegida es **una página dedicada dentro de ebecerra.es** + el Google
  Business Profile (que ya captura el pack local de Madrid por zona de servicio).
- El pack local "Madrid" lo cubre el GBP; esta página es captación **orgánica extra**.

## Qué NO hacer
- **NO** enlazarla en el **nav/menú principal ni en el hero** de la home → daría
  sensación de "solo trabajo en Madrid". El posicionamiento nacional debe quedar intacto.
- **NO** inventar clientes, precios, cifras ni testimonios. Regla del proyecto:
  **real o nada** (ver memoria `feedback_content_veracity_pro`). Clientes anónimos
  por sector si hace falta.
- **NO** crear decenas de páginas de ciudades (thin/doorway). Solo Madrid de momento
  (es creíble porque vive allí).
- **NO** usar jerga técnica visible (público = autónomos/pymes). Stack/Magnolia fuera.

## Especificaciones técnicas
- Stack: Next.js 16 + TS + Tailwind v4 + next-intl 4 + Sanity v5 (ver `apps/es/CLAUDE.md`).
- **Slug ASCII**: ruta `/diseno-web-madrid` (sin ñ ni tildes), aunque el H1/copy
  use "diseño". Equivalente EN: `/en/diseno-web-madrid` o `/en/web-design-madrid`
  (decide siguiendo `/i18n-next-intl`; el target SEO es la versión ES).
- **Bilingüe ES+EN en el mismo cambio** (next-intl falla si falta una key). La ES es
  la prioritaria; la EN puede ser traducción equivalente.
- **Reutiliza `PageHero`** y el patrón de páginas secundarias → skill **`/page-patterns`**
  (kicker, H1, lead, breadcrumbs, sub-nav verde solo en home).
- **CSS en CSS Modules co-located**, tokens vía `var(--…)` → skill **`/css-conventions`**.
  Nada de estilos inline.
- **Contenido editorial en Sanity con fallback** (títulos, leads, FAQ…) → skill
  **`/sanity-content-flow`**. Si crear un singleton nuevo es desproporcionado para una
  landing, valora un fallback en código bien estructurado; aplica el criterio del flujo
  Sanity. Cada query Sanity con `.catch(() => fallback)`.
- **Mobile-first** (≤480px primero), validar ≤768 y ≥1024.

## Contenido sugerido (estructura)
1. **Hero/H1**: incluir "diseño web" + "Madrid" de forma natural (ej. "Diseño web a
   medida en Madrid para autónomos y pymes"). Lead que deje claro: hecho en Madrid,
   **y también en remoto para toda España**.
2. **Servicios/qué incluye**: webs a medida, rápidas, fáciles de mantener, chatbot IA,
   SEO, reservas (lo real que ya ofrece).
3. **Por qué local + remoto**: cercanía si eres de Madrid (puede haber trato cercano),
   pero sin excluir al resto de España.
4. **Ejemplos**: enlazar a `/ejemplos` (las 4 demos).
5. **Diferenciación**: sin plantillas, sin permanencias, trato 1:1 (coherente con la marca).
6. **FAQ corta** (opcional) con preguntas tipo "¿cuánto cuesta una web en Madrid?",
   "¿trabajas solo en Madrid?" (respuesta: no, toda España en remoto).
7. **CTA** unificado (mismo estilo que el resto del sitio → form de contacto / DM).
8. **Enlaces internos** a home, servicios y ejemplos.

## SEO
- **Title** ~55-60 car. liderando con la keyword: ej. "Diseño web en Madrid para
  autónomos y pymes — eBecerra".
- **Meta description** ~150 car. con keyword + propuesta de valor.
- **Canonical** autorreferenciada + **hreflang** ES/EN (el sitio usa trailingSlash).
- **Structured data**: valora `Service` con `areaServed` Madrid, o `LocalBusiness`,
  coherente con el JSON-LD existente (`apps/es/components/StructuredData.tsx`, que ya
  tiene Person/ProfessionalService). No dupliques entidades; encájalo bien.
- Incluir la página en el **sitemap** (`apps/es/app/sitemap.ts`).

## Linkado (clave para no romper el posicionamiento nacional)
- **Footer**: un enlace discreto (p. ej. una sección "Zonas" o similar) → ES la vía
  visible, suficiente para indexación + algo de enlace interno.
- **Sitemap**: incluida (para que Google la encuentre).
- **NO** en el menú principal ni en el hero de la home.

## Skills a usar
`/page-patterns`, `/sanity-content-flow`, `/i18n-next-intl`, `/css-conventions`,
`/seo-aeo-best-practices`, `/copywriting` (tono PYME España, sin jerga).

## Verificación antes de cerrar
- `npx tsc --noEmit -p apps/es/tsconfig.json` en verde.
- Lanzar testers: **`tester-visual-web`** + **`tester-dev`** + **`tester-seo-a11y`**
  (en paralelo). Iterar si devuelven hallazgos.
- Comprobar que la home **sigue con posicionamiento nacional** y que la página NO
  aparece en el nav principal.

## Entregable
- Página `/diseno-web-madrid` (ES + EN) live/PR, enlazada desde footer, en sitemap,
  con SEO y structured data, copy veraz y bilingüe, y testers en verde.
- Commit siguiendo `/git-workflow` (workaround heredoc: mensaje en `commit-msg.txt`
  + `git commit -F`). Co-autoría según convención del repo.

## Memorias relevantes (consultar)
`project_meta_ads_setup`, `feedback_commercial_ux`, `feedback_content_veracity_pro`,
`project_pricing_strategy`, `project_blog_system`, `reference_email_config`.
