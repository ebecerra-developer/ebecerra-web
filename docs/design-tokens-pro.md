# Design tokens — modo pro

Tokens de color del modo "profesional" (no-geek) de ebecerra.es.
Coexiste con el modo geek mediante toggle (Fase 6 del roadmap).

## Decisiones base

- **Enfoque:** ADN compartido con el geek mode — versión desaturada y luminosa del mismo vocabulario visual.
- **Familia de grises:** warm (`stone` de Tailwind), NO cold (`slate`/`zinc`).
- **Uso del color:** estructura y tipografía 100% monocromo; verde bosque `#047857` como único acento decorativo reservado a CTAs primarios; semánticos exclusivos para estados reales.

## Referencia: modo geek (paleta actual, no sobrescribir)

| Token | Hex |
|---|---|
| Background | `#080808` |
| Accent verde neón | `#00ff88` |
| Accent azul | `#00ccff` |

## Modo pro — tokens

### Estructura

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#FAFAF9` | Fondo principal (warm white) |
| `surface` | `#FFFFFF` | Cards, modales, inputs |
| `surface-subtle` | `#F5F5F4` | Secciones alternas, zebra |
| `border` | `#E7E5E4` | Divisores sutiles |
| `border-strong` | `#D6D3D1` | Inputs, tablas |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `text` | `#0C0A09` | Titulares, copy principal |
| `text-secondary` | `#44403C` | Párrafos, body |
| `text-muted` | `#78716C` | Captions, metadata |
| `text-disabled` | `#A8A29E` | Estados inactivos |

### Interactivos

| Token | Hex | Uso |
|---|---|---|
| `fg` | `#0C0A09` | Botones secundarios, iconos |
| `fg-hover` | `#292524` | Hover de monocromos |
| `focus-ring` | `#A8A29E` | Anillo de focus accesible |

### CTA primario (único acento decorativo)

| Token | Hex | Uso |
|---|---|---|
| `cta` | `#047857` | Botones primarios, links destacados |
| `cta-hover` | `#065F46` | Hover de CTA |

### Semánticos (solo para estados reales)

| Token | Hex |
|---|---|
| `success` | `#15803D` |
| `warning` | `#B45309` |
| `error` | `#B91C1C` |
| `info` | `#1E40AF` |

## Implementación prevista

- Mapear a CSS custom properties (`--color-bg`, `--color-cta`, etc.) en el layout raíz.
- Toggle geek/pro vía `data-mode` en `<html>`.
- Tailwind v4: declarar tokens con `@theme` en `app/globals.css`.
- El modo geek conserva su paleta original — no sobrescribir.

## Filosofía de aplicación

- **Monocromo por defecto.** Títulos, body, iconos, botones secundarios: negro sobre warm white.
- **Verde solo en CTAs primarios.** Si aparece verde en otro sitio, es error.
- **Semánticos jamás decorativos.** Si no representa un estado (success/error/warning/info), usar neutros.
- **Sin gradientes.** Colores planos.
- **Contrast ratio AA mínimo** en todas las combinaciones texto/fondo.
