---
name: css-conventions
description: Convenciones CSS del proyecto tras la decisión de eliminar inline styles. Úsalo al escribir estilos para componentes nuevos, al portar un componente existente de style inline a CSS Modules, o al añadir clases/media queries.
---

# CSS conventions — ebecerra-web

**Decisión (2026-04-23):** **CSS Modules co-located.** No más `style={{…}}` en los componentes.

## Estructura

Cada componente tiene su `*.module.css` en la misma carpeta:

```
apps/es/components/sections/
├── Services.tsx
└── Services.module.css
```

Los tokens viven en [`packages/tokens/pro.css`](../../../packages/tokens/pro.css), ya importados globalmente por [`apps/es/app/globals.css`](../../../apps/es/app/globals.css). El module los consume directamente con `var(--…)`.

## Import y uso

```tsx
import styles from "./Services.module.css";

export default function Services() {
  return (
    <section className={styles.services}>
      <div className={styles.grid}>
        <article className={styles.card}>…</article>
      </div>
    </section>
  );
}
```

```css
/* Services.module.css */
.services {
  padding: clamp(40px, 5vw, 72px) clamp(20px, 4vw, 56px);
  background: var(--surface-subtle);
  border-bottom: 1px solid var(--border);
}

.grid {
  display: grid;
  gap: var(--s-5);
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Naming

- **Archivos:** `ComponentName.module.css` (coincide con el componente).
- **Clases:** `camelCase` en el CSS y en el JS (`.servicesGrid`, no `.services-grid`). Next.js hashea automáticamente, no hay riesgo de colisión.
- **BEM-light opcional** si un componente tiene variantes: `.button`, `.buttonPrimary`, `.buttonGhost`. No hace falta separador `__` ni `--`.

## Tokens vs valores literales

**Siempre via token si existe:**

```css
.card {
  background: var(--surface);           /* no #ffffff */
  border: 1px solid var(--border);      /* no #e7e5e4 */
  border-radius: var(--r-lg);           /* no 10px */
  padding: var(--s-5);                  /* no 24px */
  color: var(--text);                   /* no #0c0a09 */
}
```

**Literales OK solo para:**
- Valores estructurales (`1fr`, `100%`, `auto`).
- Valores que el token no cubre (ej. `gap: 20px` si no encaja exacto con `--s-5` = 24px y pixel-perfect importa).
- En ese caso preferir redondear al token más cercano — la consistencia vale más que 4px.

## Breakpoints

| Breakpoint | Uso típico |
|---|---|
| `@media (min-width: 640px)` | phablet / tablet vertical |
| `@media (min-width: 720px)` | grid 2 cols en cards medianas (services) |
| `@media (min-width: 1024px)` | desktop (hero split, nav full) |
| `@media (min-width: 1280px)` | desktop amplio |

Ya en uso en la codebase — no inventar breakpoints nuevos sin razón.

## Hover, focus, responsive

Todo dentro del module, no fuera:

```css
.card {
  transition: transform 180ms var(--ease), border-color 180ms var(--ease);
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--cta);
  box-shadow: var(--sh-2);
}

.card:focus-within {
  outline: 2px solid var(--cta);
  outline-offset: 2px;
}
```

## Composición de clases condicionales

Usar **template literals nativos** — no añadir `clsx` (falló en Vercel monorepo aunque pasaba en local):

```tsx
/* una condición */
<button className={`${styles.button}${isPrimary ? ` ${styles.buttonPrimary}` : ""}`}>

/* varias condiciones */
<button className={[styles.button, isPrimary && styles.buttonPrimary, disabled && styles.buttonDisabled].filter(Boolean).join(" ")}>
```

Si no hay condicionales, basta con: `` className={`${styles.a} ${styles.b}`} ``.

## Estilos globales

En [`apps/es/app/globals.css`](../../../apps/es/app/globals.css) solo:
- Reset / base (`*`, `html`, `body`).
- Fonts (ya carga con `next/font`).
- Import de tokens (`pro.css`).
- Bloque `@theme inline` para Tailwind v4.
- Estilos de `.lead`, `.prose` u otras clases verdaderamente globales (pocas).

**No añadir estilos de componente al `globals.css`.** Todo componente → su module.

## Tailwind v4 — cuándo usar

Instalado pero **no para composición**. Excepciones:

- Utilities spot ya en uso en `apps/tech` — se mantienen hasta su propio refactor.
- Clases del `LogoMark` o componentes que ya están íntegros con Tailwind — no regresionar sin plan.

Nuevos componentes en `apps/es`: **CSS Modules, no Tailwind**.

## Refactor inline → module (3 pasos)

1. Crear `Component.module.css` en la carpeta del componente.
2. Por cada `style={{…}}` → crear una clase en el module con el mismo contenido, reemplazando literales por tokens.
3. Sustituir `style={{…}}` por `className={styles.xyz}`; migrar bloques `<style>{`...`}</style>` al module (ojo con selectores hijos — scoped CSS requiere `:global(.foo)` o mover a clases propias).

## Qué NO hacer

- `style={{ color: "#047857" }}` — ni color literal, ni style inline.
- Hardcodear spacing (`padding: 17px`) si hay token cercano.
- Crear `.servicesCardHoverAccentVariant` con 15 propiedades — si sale algo así, el componente pide split.
- Meter lógica de estilos globales en un `.module.css` — va a `globals.css`.
- Tailwind utilities para componer layout (`className="flex gap-4 p-6 bg-white"`).
