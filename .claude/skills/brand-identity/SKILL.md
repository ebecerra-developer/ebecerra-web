---
name: brand-identity
description: Sistema de marca del proyecto (logos eB, bracket-B, favicon, kit de assets). Úsalo al tocar logos, favicons, OG images, componentes de Nav/Footer que muestran la marca, o al añadir nuevos assets de brand.
---

# Brand identity — ebecerra-web

**Logo y paleta cerrados 2026-04-19.** No tocar sin consultar.

## Sistema de marks según contexto

| Mark | Cuándo | Dónde |
|---|---|---|
| **eB completo** (monograma con swoosh en el pie de la e) | Modo pro, identidad comercial | `apps/es` Nav, Hero, emails, facturas, casos de estudio, OG images |
| **`<B>`** (B entre brackets) | Modo geek / tech | `apps/tech` Nav, dominio `.tech`, GitHub, badges técnicos, **favicon de `apps/tech`** (verde neón) |
| **B sola** | Favicon ≤32px de `apps/es` | `apps/es/app/icon0.svg` (verde bosque sobre cream) |
| **`e` sola** (con swoosh) | Favicon ≤32px de `apps/demos` | `apps/demos/app/icon.tsx` (fallback) y `apps/demos/app/[locale]/[slug]/icon.tsx` (dinámico, color = `brand.primaryColor` de la demo) |

`apps/tech` sí aguanta el `<B>` completo a 32px porque los brackets son trazos rectos finos, simplificados — el monograma eB con swoosh, en cambio, se difumina, por eso `apps/es` y `apps/demos` usan cada uno su mitad del monograma.

**Favicon de `apps/demos`:** glifo `e` extraído de `logo-master.svg` (paths del bowl + swoosh) renderizado vía `next/og` `ImageResponse` con `<svg>` inline. El icon de cada `[slug]` lee `brand.primaryColor` del doc `demoSite` en Sanity y pinta la `e` en cream sobre ese color, así cada demo tiene su favicon coherente con su paleta. La raíz `demos.ebecerra.es/` usa el acento de `apps/es` como fallback.

## Kit de archivos

Cada app duplica los assets en su propio `public/brand/` para que Next.js sirva desde el `public/` correspondiente:

### `apps/es/public/brand/`

- `logo-master.svg` — eB full color + swoosh
- `logo-black.svg`, `logo-white.svg`, `logo-green.svg` — variantes eB monocrómo
- `logo-scale-balanced.svg`, `logo-scale-deep.svg` — variantes expresivas eB
- `logo-poli-cachas.svg`, `logo-poli-letras.svg` — variantes policromas opcionales
- `logo-bracket-b-{green,black,white}.svg` — `<B>` (verde `#047857` para pro si se usa)
- `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png` — OG/manifest

### `apps/tech/public/brand/`

- Kit similar + `logo-bracket-b-neon.svg` (`#00ff88` verde neón) — **usado en el Nav de `apps/tech`**.

## Favicons

Generados con [realfavicongenerator.net](https://realfavicongenerator.net) y desplegados en `apps/<app>/app/`:

- `apps/tech/app/icon0.svg` — **`<B>` completo con brackets en `#00ff88`**.
- `apps/es/app/icon0.svg` — **B sola sin brackets en verde bosque**.
- Complementos: `favicon.ico`, `icon1.png`, `apple-icon.png` + `manifest.json`.

Backup histórico "eB sobre verde" (para apps móviles futuras) en [`docs/logo-exploration/app-icons-eB-backup/`](../../../docs/logo-exploration/app-icons-eB-backup/).

## Paleta asociada

- **Modo pro (apps/es):** stone warm + verde bosque `#047857` único acento. Detalle en `/design-tokens`.
- **Modo geek (apps/tech):** fondo `#080808`, verde neón `#00ff88`, azul `#00ccff`. Detalle en `/design-tokens`.

## Fuente editable

Path del `<B>` bracket generado con `fontkit` extrayendo glifos de DM Sans 900 (de `@fontsource/dm-sans/latin-900-normal.woff2`); B compartida con el eB original. Fuente editable del path: [`docs/logo-exploration/logo-bracket-b-draft.svg`](../../../docs/logo-exploration/logo-bracket-b-draft.svg). SVG finales unificados en Illustrator con Pathfinder Unite.

## Docs de referencia obligatoria

Antes de tocar la marca:

- [`docs/brand-logo.md`](../../../docs/brand-logo.md) — reglas de uso, kit, pendientes.
- [`docs/logo-exploration/brand-manual.html`](../../../docs/logo-exploration/brand-manual.html) — manual visual consultable (9 secciones: concepto, variantes, escalas 16→192px, paleta, tipografía, clear space, do's & don'ts, referencia rápida).

## Reglas duras

- **No cambiar el kit** (logo files, favicons, tokens de color) sin consultar al usuario. Decisión cerrada.
- **No mezclar marcas:** eB en `apps/es`, `<B>` en `apps/tech`, `e` en `apps/demos`. Nunca el `<B>` neón en modo pro ni el eB verde bosque en modo geek.
- **No recolorear** los SVG con CSS `filter` — usar la variante correcta del kit.
- **Favicon:** B sola en `apps/es`, `<B>` con brackets en `apps/tech`, `e` con swoosh en `apps/demos`. El monograma eB completo no es legible a 32px.

## Cuándo ampliar el kit

Si necesitas una nueva variante (ej. B en un color aún no cubierto), consultar primero. La regla es: **consistencia sobre creatividad** en este capítulo.
