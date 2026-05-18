---
name: page-patterns
description: Patrón canónico de páginas secundarias en apps/es (no-home) — componente PageHero compartido, reglas de kicker/H1/lead/breadcrumbs, sub-nav verde solo en home, y patrones de listado (rows no cards, sin sort UI, pills para categorías). Úsalo cuando vayas a crear una página nueva en apps/es (FAQ, listados, secciones tipo casos/guías futuros) o un nuevo listado de contenido.
---

# Patrón canónico de páginas secundarias — apps/es

Toda página secundaria de `apps/es` (no-home: Blog, FAQ, Ejemplos, futuras) usa el componente compartido **`<PageHero kicker title lead breadcrumbs? />`** en [`apps/es/components/sections/PageHero.tsx`](../../apps/es/components/sections/PageHero.tsx). No se crean heroes ad-hoc — si el patrón no cubre tu caso, se cambia el componente, no se inventa uno nuevo para esa página.

## Reglas del hero

- **Kicker**: formato `// PALABRA_CORTA` en UPPERCASE (`// BLOG`, `// FAQ`, `// EJEMPLOS`, `// TAG`…). Una palabra que identifica la sección. Texto descriptivo va al lead, no al kicker.
- **H1**: token `--fs-h2` (32→48px), peso 600, alineado a la izquierda. **No** se usa `--fs-h1` ni `--fs-display` fuera del hero del home.
- **Lead**: clase global `.lead`, max-width 640px. Opcional.
- **Breadcrumbs**: `<Breadcrumbs items={...} />` (lo emite PageHero internamente cuando recibe la prop). Visibles + JSON-LD `BreadcrumbList` autogenerado. **Solo en nivel ≥ 2** (detalle de post, categoría, tag…). En listados de nivel 1 (`/blog`, `/faq`, `/ejemplos`) son ruido — el logo + nav top cubren la orientación.
- **Sub-nav verde claro** (`.subNav` en `Nav.tsx`): solo se renderiza en home. Fuera de home no aparece — los breadcrumbs y la nav top (que ya hace `/#section`) cubren la navegación.

## Listados de contenido

Aplicable al blog y a futuras secciones tipo "casos", "guías"…:

- **Filas (rows), no cards** para el listado principal. Cards se reservan para módulos secundarios (related posts, sliders, mosaicos densos). Patrón en [`apps/es/components/blog/PostRow.tsx`](../../apps/es/components/blog/PostRow.tsx): texto izquierda + cover derecha en desktop, cover arriba + texto debajo en mobile.
- **Sin sort UI**. Orden cronológico fijo (más recientes primero). El editor decide la prioridad publicando.
- **Filtro por categoría como pills** (server component, links directos a `/blog/categoria/[slug]`), no `<select>`. Patrón en [`apps/es/components/blog/CategoryPills.tsx`](../../apps/es/components/blog/CategoryPills.tsx).

## Wrappers de sub-páginas

`<main>` es flex item del `<body flex-col>`. El wrapper de la página necesita `width: 100%` además del `max-width` + `margin: 0 auto`; sin width 100% el margin auto encoge el wrapper a content-size en lugar de estirarlo. Ver memoria `feedback_flex_auto_margin_shrink`.
