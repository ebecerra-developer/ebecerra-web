# `packages/tokens`

Design tokens compartidos entre las dos identidades del proyecto.

## Estructura

| Archivo | Destino (post-Fase 5) | Contenido |
|---|---|---|
| [`pro.css`](pro.css) | `apps/es` → ebecerra.es | Modo pro: stone warm + verde bosque `#047857`. Escaparate comercial. |
| [`geek.css`](geek.css) | `apps/tech` → ebecerra.tech | Modo geek: negro warm + verde neón `#00ff88`. Identidad técnica. |

## Estado actual (pre-monorepo)

Mientras el repo es single-app, ambos archivos conviven aquí. Solo definen CSS custom properties — no hay conflicto de renderizado porque cada variable tiene un prefijo distinto (`--` sin prefijo para pro, `--geek-*` para geek).

`app/globals.css` importa ambos; el modo pro está activo por defecto en la rama `migracion-nextjs`. La paleta geek sobrevive para que `apps/tech` la herede intacta cuando se ejecute el split del monorepo.

## Split monorepo (Fase 5 del roadmap)

En Fase 5 esta carpeta se mueve literal a `packages/tokens/` del monorepo sin cambios internos. Las apps consumirán así:

```css
/* apps/es/app/globals.css */
@import "tailwindcss";
@import "@ebecerra/tokens/pro.css";

/* apps/tech/app/globals.css */
@import "tailwindcss";
@import "@ebecerra/tokens/geek.css";
```

Una única fuente de verdad para tokens → cualquier ajuste de paleta en una identidad se hace aquí y afecta a su app correspondiente.

## Origen de cada set

- **`pro.css`** — extraído del handoff bundle de Claude Design generado el 2026-04-22. Referencia histórica completa en [`docs/design-handoff-2026-04-22/`](../../docs/design-handoff-2026-04-22/). Documentación de la paleta en [`docs/design-tokens-pro.md`](../../docs/design-tokens-pro.md).
- **`geek.css`** — extraído del SPA legacy React+Vite (pre-migración Next.js) preservado en la rama `main`. Documentación detallada en el skill [`/legacy-vite-codebase`](../../.claude/skills/legacy-vite-codebase/SKILL.md).

## Reglas de uso

- **NO mezclar** variables de un set con el otro en el mismo componente. Cada identidad vive en su app.
- **NO añadir colores fuera de los tokens** — si hace falta un nuevo matiz, se añade al archivo correspondiente con nombre semántico.
- **NO usar slate/zinc** (grises fríos) en modo pro — siempre stones cálidos.
- **NO gradientes** en modo pro — el acento verde vive sin transiciones de color.
