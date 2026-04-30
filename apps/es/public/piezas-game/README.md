# Piezas — Landing Page

Landing page estática de la app **Piezas** (juego de puzzles con fotos personales).
Diseñada para vivir en `ebecerra.es` y enlazar a Google Play y App Store.

## Estructura de archivos

```
piezas-game-landing/
├── index.html          ← landing principal
├── privacidad.html     ← política de privacidad (RGPD)
├── terminos.html       ← términos de uso
├── styles.css          ← todos los estilos (sin dependencias externas)
└── assets/
    ├── logo.svg        ← logo completo con fondo oscuro (usado en nav y favicon)
    ├── icon.svg        ← solo las piezas de puzzle (usado en footer)
    └── icon-192.png    ← icono raster 192×192 (apple-touch-icon)
```

## Tecnología

- HTML + CSS puros. Sin frameworks, sin bundler, sin JavaScript.
- Fuentes: **Playfair Display** + **Inter** vía Google Fonts (CDN).
- Responsive: móvil, tablet y escritorio. Mobile-first.
- Sin dependencias del proyecto React/Vite de la app.

## Paleta de colores

Mismos valores que la app, definidos como variables CSS locales en `styles.css`:

| Variable      | Valor       | Uso                          |
|---------------|-------------|------------------------------|
| `--bg`        | `#FAF7F2`   | Fondo principal (beige)      |
| `--surface`   | `#F0E8D8`   | Secciones alternas           |
| `--ink`       | `#2C2416`   | Texto principal              |
| `--wood`      | `#6B5C3E`   | Texto secundario             |
| `--amber`     | `#C17B3A`   | Accent (botones, CTA, links) |
| `--stone`     | `#9C8E7A`   | Texto terciario / meta       |
| `--border`    | `#DDD4C0`   | Bordes y divisores           |

## Cosas a actualizar antes de publicar

1. **Enlace de Google Play** — los dos badges enlazan a la app publicada:
   ```
   https://play.google.com/store/apps/details?id=es.ebecerra.piezasgame
   ```

2. **App Store** — el badge de Apple está marcado como "Próximamente".
   Cuando la app se publique en App Store, añadir el `href` y quitar el chip
   `badge-soon-chip` y la clase `badge-apple` que lo deshabilita visualmente.

3. **Email de contacto** — aparece en el footer y en las páginas legales:
   `ebecerra.developer@gmail.com`. Cambiar si el contacto oficial es otro.

4. **Open Graph image** — `<meta property="og:image" content="./assets/og-image.png">`.
   El archivo `og-image.png` no existe aún. Crear una imagen de 1200×630px
   para que los previews en redes sociales tengan thumbnail.

5. **Páginas legales** — `privacidad.html` y `terminos.html` tienen contenido
   real y completo, pero conviene que un abogado o asesor legal las revise
   antes de publicar en Play Store (Google lo exige).

## Despliegue

La carpeta es completamente autocontenida. Para desplegarla:

- **Vercel / Netlify / GitHub Pages:** arrastra la carpeta o apunta al directorio.
  No requiere build step — es HTML estático.
- **Servidor propio (ebecerra.es):** sube los archivos al directorio que corresponda.
  Si la landing va en la raíz, los enlaces relativos (`./privacidad.html`) funcionan tal cual.
  Si va en una subcarpeta (ej. `/piezas/`), también funcionan sin cambios.

## Decisiones de diseño

- **SVG inline en el mockup del teléfono** — el teléfono del hero es un SVG dibujado
  a mano que simula la UI de la app. No depende de screenshots reales, así que
  funciona aunque la app cambie visualmente. Contiene los paths reales del logo.
- **IDs de gradientes duplicados** — el icono de Google Play aparece dos veces
  (hero y CTA). Los gradientes SVG usan IDs únicos (`gp1a/b/c/d` y `gp2a/b/c/d`)
  para evitar conflictos entre los dos SVG en el mismo documento.
- **`scroll-padding-top: 72px`** — compensa la barra de navegación sticky al saltar
  al ancla `#descargar` con el botón "Descargar" del nav.
- **Badges `min-width: 210px`** — evita que los badges de tienda se compriman
  en pantallas intermedias.
