---
name: design-tokens
description: Paleta, tokens CSS y sistema de anotaciones del proyecto. Úsalo al escribir estilos, tocar paletas, añadir variantes visuales, consumir tokens desde componentes o añadir anotaciones hand-drawn con rough-notation.
---

# Design tokens — ebecerra-web

Fuente de verdad CSS para las dos identidades del proyecto. Vive en [`packages/tokens/`](../../../packages/tokens/).

## ⚠ Sincronizar `tenant_branding` en Supabase

Si tocas valores en `pro.css`, `geek.css`, `demos-fisio.css`, `demos-coach-editorial.css`, `demos-coach-vibrant.css`, `demos-tandem.css` o cualquier archivo de tokens — **actualiza también la tabla `public.tenant_branding` en Supabase**. Esa tabla es snapshot manual de los tokens y la consume el Generador Social (`/admin/social`) + futuras herramientas multi-tenant.

Mapping tenant → archivo de tokens:

| Slug (tenants) | Archivo de tokens |
|---|---|
| `apps-es` | `packages/tokens/pro.css` |
| `apps-tech` | `packages/tokens/geek.css` |
| `apps-demos` | `packages/tokens/pro.css` (meta-site) |
| `demo-equilibrio` | `packages/tokens/demos-fisio.css` |
| `demo-marta-solana` | `packages/tokens/demos-coach-editorial.css` |
| `demo-claudia-entrena` | `packages/tokens/demos-coach-vibrant.css` |
| `demo-eco` | `packages/tokens/demos-tandem.css` |
| `llaullau`, `brunette-agency` | tokens en sus repos externos (no en este monorepo) |

Patrón de update:
```sql
update public.tenant_branding
set bg = '#nuevo-bg', fg = '#nuevo-fg', primary_color = '#nuevo-primary',
    accent = '#nuevo-accent', font_display = 'NuevaFont', font_body = 'OtraFont'
where tenant_id = (select id from public.tenants where slug = '<slug>');
```

Detalle de qué columnas existen y cómo se usan en [[project-social-generator]].

## Archivos

| Archivo | Identidad | App consumidora | Convención |
|---|---|---|---|
| [`packages/tokens/pro.css`](../../../packages/tokens/pro.css) | modo pro (stone warm + verde bosque `#047857`) | `apps/es` | Variables sin prefijo: `--cta`, `--bg`, `--text`, `--fs-h1`, `--s-5`, etc. |
| [`packages/tokens/geek.css`](../../../packages/tokens/geek.css) | modo geek (fondo `#080808`, neón `#00ff88`, azul `#00ccff`) | `apps/tech` (pendiente integración completa) | Variables con prefijo `--geek-*` para coexistir con pro sin colisión |

## Paleta modo pro — reglas

- **Únicos colores permitidos** son los definidos en `pro.css`. **No añadir** tonos fuera de esa paleta (ni slate, ni zinc, ni azules nuevos).
- **No gradientes.** Monocromo warm con un solo acento verde.
- Stone warm (nunca `#000` puro — usar `--ink: #1c1917`).
- CTA: `--cta: #047857` (emerald-700), hover `--cta-hover: #065f46`.

## Integración por app

### `apps/es`

[`apps/es/app/globals.css`](../../../apps/es/app/globals.css) importa `pro.css` y re-expone los tokens como utilities de Tailwind v4 vía bloque `@theme inline` (`--color-cta`, `--color-bg`, `--color-text-muted`, etc.). Permite usar clases `bg-cta`, `text-text-secondary`, `border-border-strong`.

**Para composición usa `var(--cta)` directamente desde `.module.css`**, no las utilities. Las utilities de Tailwind quedan para casos puntuales o para componentes que ya estaban con ellas. Ver `/css-conventions`.

### `apps/tech`

Mantiene su paleta geek inline (valores literales `#080808`, `#00ff88`, etc.) en [`apps/tech/app/globals.css`](../../../apps/tech/app/globals.css). No consume `packages/tokens/geek.css` todavía — se integrará cuando se homogeneice con la estructura pro.

## Escala fluida

Tipografía con `clamp()` en `pro.css`: `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-h4`, `--fs-body-lead`, `--fs-body-lg`, `--fs-body`, `--fs-sm`, `--fs-xs`.

Spacing 4px base: `--s-0` a `--s-10` (0 → 128px).

Radii: `--r-sm` a `--r-xl` + `--r-pill`.

Sombras warm: `--sh-1`, `--sh-2`, `--sh-3`, `--sh-focus`.

## Handoff de Claude Design

[`docs/design-handoff-2026-04-22/`](../../../docs/design-handoff-2026-04-22/) contiene el bundle exportado tras la sesión de diseño del modo pro. Fuente de verdad visual para cualquier duda sobre layout, jerarquía o tratamiento visual:

- `project/index.html` — home como HTML/CSS/JS standalone (2178 líneas) con todos los tokens y la estructura final validada.
- `chats/chat1.md` — transcript de la conversación con Claude Design.
- `README.md` — instrucciones para agentes que implementan el diseño.

**Al implementar nuevos componentes pro, consulta primero `project/index.html`** para ver el diseño de referencia antes de inventar nada.

## Anotaciones hand-drawn — rough-notation

Librería vanilla JS [`rough-notation`](https://roughnotation.com/) 0.5.1 ya instalada. Soporta 7 tipos: `underline`, `circle`, `box`, `highlight`, `strike-through`, `crossed-off`, `bracket`.

Wrapper React en [`apps/es/components/annotations/AnnotatedText.tsx`](../../../apps/es/components/annotations/AnnotatedText.tsx) que parsea markup inline en strings i18n:

```
"Construyo webs [circle]a medida[/circle] para tu negocio."
```

Soporta `[circle]`, `[underline]`, `[box]`, `[highlight]`, `[strike-through]`, `[crossed-off]`, `[bracket]`. Padding y stroke por defecto verde (`--cta`).

**No dibujar SVG artesanal.** Si aparece una anotación nueva, usar rough-notation.

## Qué NO hacer

- Añadir colores fuera de la paleta (pro o geek).
- Mezclar tokens de apps distintas — geek tokens no van en `apps/es`.
- Hardcodear valores que ya existen como token (ej. `#047857` en vez de `var(--cta)`).
- Redefinir escalas tipográficas o spacing ad-hoc en un componente.
- Tocar la paleta sin consultar: decisión cerrada 2026-04-19.
