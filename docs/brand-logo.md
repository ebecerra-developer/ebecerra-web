# Logo eBecerra — decisión oficial

**Maestro:** `public/brand/logo-master.svg` (servible en `/brand/logo-master.svg`).
**Fecha cierre:** 2026-04-19.

## Concepto

Monograma "eB" minúscula-mayúscula en 4 piezas con hairlines entre ellas. La e lleva un swoosh pronunciado en el pie.

**Transmite:** precisión técnica + criterio estético. Alineado con el positioning "Tech Architect que capta autónomos y PYMEs".

## Paleta

**Acento oficial:** verde bosque `#047857` (emerald-700). Validado vs teal en preview comparativo.

Tokens completos en [`design-tokens-pro.md`](design-tokens-pro.md).

## Kit cerrado (5 variantes)

Ubicación: `public/brand/`. También en `docs/logo-exploration/` como archivos de trabajo.

### Uso diario — mono (3)

| Archivo | Color | Uso |
|---|---|---|
| `logo-black.svg` | Negro `#0C0A09` | **PRIMARY** — uso general, 80% de los contextos |
| `logo-white.svg` | Blanco `#FAFAF9` | Modo geek (`#080808`) y fondos oscuros |
| `logo-green.svg` | Verde `#047857` | Variante acento — usos puntuales |

### Uso expresivo — escalas verdes (2)

Reservadas para **hero, portadas de secciones, redes sociales, presentaciones**. No usar en uso diario ni favicon.

| Archivo | Tonos (emerald) |
|---|---|
| `logo-scale-balanced.svg` | 400 / 500 / 700 / 900 |
| `logo-scale-deep.svg` | 500 / 700 / 800 / 950 |

### Opcionales

`logo-poli-cachas.svg`, `logo-poli-letras.svg` — variantes 2-color si se necesitan.

## Favicon — solo B verde

Decidido tras probar que el eB completo se empasta a 16px. La B sola (las 2 cachas) sobre transparente funciona mejor a tamaños favicon.

**Archivos activos:**
- `app/icon0.svg` — SVG favicon (B verde sin fondo).
- `app/favicon.ico` — multi-size ICO.
- `app/icon1.png` — PNG fallback.
- `app/apple-icon.png` — iOS home screen (B verde sobre fondo verde, 180×180).
- `app/manifest.json` — PWA manifest (theme_color `#FAFAF9`, background_color `#047857`).
- `public/brand/web-app-manifest-192x192.png` — Android PWA.
- `public/brand/web-app-manifest-512x512.png` — Android PWA.

**Generados con** [realfavicongenerator.net](https://realfavicongenerator.net) a partir de `favicon-b-only.svg` (fuente hoy archivada, ver backup).

## Backup — app icons con eB completo

`docs/logo-exploration/app-icons-eB-backup/` contiene la versión **eB completo sobre verde** que se probó inicialmente. Se guardó para uso futuro en apps móviles, donde a 180-512 px el logo eB completo se lee perfectamente y da más personalidad que la B sola.

Contenido del backup:
- `favicon.ico` (eB multi-size)
- `apple-icon.png` (180×180)
- `icon1.png`
- `web-app-manifest-192x192.png`
- `web-app-manifest-512x512.png`
- `manifest.json`

Usar si/cuando se empaquete como app móvil (TWA Android, PWA instalable, wrapper Capacitor, etc.).

## Reglas de uso

- **Nunca** deformar, rotar o alterar proporciones del símbolo.
- **Nunca** mezclar colores fuera del kit.
- Tamaño mínimo con el logo completo: **32px**. Por debajo se usa la variante favicon (B sola).
- Separación mínima: 1× el ancho del tallo de la B.
- **Primario = `logo-black.svg`** salvo contexto que exija otra variante.

## Pendientes

- [ ] Elegir fuente del wordmark (Geist / Inter / Söhne, peso Medium).
- [ ] Crear OG image 1200×630 con `logo-scale-deep.svg` sobre warm white.
- [ ] Actualizar `openGraph.images` y `twitter.images` en `app/layout.tsx` cuando haya OG image.
