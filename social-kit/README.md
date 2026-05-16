# social-kit

Toolbox local para producir contenido de Instagram + Facebook para ebecerra.es (cuenta `@ebecerra.dev`) y, en paralelo, para Piezas Game.

> **Antes de producir nada**, abre [`PLAN.md`](PLAN.md): backlog, qué está en producción, qué se ha publicado, cooldown de temas.

---

## Tres archivos de gobernanza

| Archivo | Para qué |
|---|---|
| [`PLAN.md`](PLAN.md) | Backlog + en producción + publicado + cooldown + cadencia. **Editar cada vez que se publica algo.** |
| [`CATEGORIES.md`](CATEGORIES.md) | Las 5 categorías de contenido + anti-patrones. No publicar dos seguidas de la misma categoría. |
| [`README.md`](README.md) | Este archivo — estructura técnica y comandos. |

Skill canónica con paleta, tamaños, workflow Playwright/GSAP, gotchas y captions: [`~/.claude/skills/social-media-kit/SKILL.md`](../../.claude/skills/social-media-kit/SKILL.md).

---

## Estructura (canónica desde 2026-05-16)

```
social-kit/
├── README.md · PLAN.md · CATEGORIES.md
├── package.json + package-lock.json
├── node_modules/                            (ignored)
│
├── scripts/                                 Automatización Node
│   ├── record-animated.mjs                  Recorder canónico (Reels + Stories animadas)
│   ├── render-statics.mjs                   PNGs estáticas (posts + stories + slides)
│   ├── capture-demos.mjs                    Captura demos vivas de producción
│   └── record-chatbot.mjs                   (legacy)
│
├── personal/                                Cuenta @ebecerra.dev
│   ├── assets/                              SOURCE assets compartidos
│   │   ├── avatars/                         Logos eB (PNG + SVG)
│   │   ├── logos/                           Bracket-B SVGs
│   │   ├── yo/                              Fotos personales (fondos)
│   │   ├── captures/  (ignored)             Capturas de demos.ebecerra.es
│   │   └── utilities/                       Tooling HTML (extract-eB-white, invert-avatar)
│   │
│   ├── highlights/                          Portadas de highlights IG (no son piezas publicables)
│   │   ├── _base.css
│   │   ├── sobre-mi.html → sobre-mi.png  (ignored)
│   │   ├── servicios.html → servicios.png
│   │   ├── webs.html · proyectos.html · piezas.html · contacto.html
│   │
│   ├── covers/                              FB cover + Google Business Profile cover
│   │   ├── fb-cover.html → fb-cover.png  (ignored)
│   │   └── gbp-cover.html → gbp-cover.png
│   │
│   ├── legacy/                              Drafts no usados, preservados por referencia
│   │
│   └── 0001-post-lo-que-no-hago/            ──── UNA CARPETA POR PIEZA ────
│       ├── index.html                       Fuente HTML
│       ├── final.png  (ignored)             Output renderizado
│       └── captions.md                      Caption + alt + comentario fijado + stickers + música
│       (variantes según tipo:)
│       │   Carrusel:     _base.css + slide-1..N.html + slide-1..N.png + captions.md
│       │   Story/Reel anim: index.html + final.mp4 + poster.png + captions.md
│       │   Story estática: index.html + final.png + captions.md
│       │   Post estático: index.html + final.png + captions.md
│   ├── 0002-carrusel-4-demos/
│   ├── 0003-story-chatbot/
│   ├── ...
│   └── 0013-story-madrid/
│
└── piezas-game/                             Cuenta del juego (cuando empiece a producir, mismo patrón)
    ├── assets/
    └── legacy/
```

## Convenciones de naming

- **`NNNN-tipo-slug/`** (4 dígitos, zero-padded). Ordena alfabéticamente = cronológicamente.
- **Tipos en el slug**: `post`, `carrusel`, `story`, `reel`.
- **Próximo número** = mayor existente + 1. Al crear pieza nueva, mira `ls personal/00*/ | tail -1` y le sumas 1.
- **Dentro de cada carpeta** siempre:
  - `index.html` (fuente)
  - `captions.md` (textos para subir)
  - Output: `final.{mp4|png}` y `poster.png` (animadas) o `slide-N.png` (carruseles)

## Qué está en git, qué no

**Trackeado** (texto + assets de marca pequeños):

- `scripts/*.mjs`
- `personal/00NN-*/index.html` + `slide-*.html` + `_base.css`
- `personal/00NN-*/captions.md`
- `personal/highlights/*.html` + `_base.css`
- `personal/covers/*.html`
- `personal/legacy/*.html`
- `personal/assets/avatars/*.{png,svg}`
- `personal/assets/logos/*.svg`
- `personal/assets/yo/*.jpg`
- `personal/assets/utilities/*.html`

**Ignorado** (binarios renderizables, regenerables):

- `node_modules/`
- `**/_tmp-*/`
- `personal/00NN-*/final.*`, `poster.png`, `slide-*.png`
- `personal/highlights/*.png`
- `personal/covers/*.png`
- `personal/assets/captures/`
- `personal/legacy/*.png`

---

## Workflow — crear una pieza nueva

1. **Mira `PLAN.md`** → "En producción" + "Cooldown" + última categoría publicada.
2. **Identifica el siguiente número** disponible (`ls personal/00*/ | tail -1` → +1).
3. **Crea la carpeta** `personal/NNNN-tipo-slug/`.
4. **Escribe el HTML** (`index.html`) con los paths relativos correctos:
   - Foto del estudio: `url("../assets/yo/enrique-estudio.jpg")`
   - Captura demo: `url("../assets/captures/demo-XXX.png")`
5. **Si es animada (Reel o Story con GSAP)**:
   - Añade el target a `scripts/record-animated.mjs` (`{ name, folder, duration }`)
   - Graba: `cd scripts && node record-animated.mjs NNNN-tipo-slug` (o sin argumento para todos)
6. **Escribe `captions.md`** con: caption, alt text, comentario fijado, sticker recommendations, música sugerida, notas.
7. **Actualiza `PLAN.md`**: añade a "En producción" con fecha de publicación prevista.

## Regenerar todos los binarios

```bash
cd social-kit/scripts
node capture-demos.mjs       # re-captura demos.ebecerra.es
node render-statics.mjs      # PNGs (posts, carruseles, stories estáticas)
node record-animated.mjs     # MP4s (todos los reels/stories animadas)
```

## Cross-post Facebook

- **Posts e imágenes** → cross-post automático (configurado en IG).
- **Stories** → marcar manualmente "Compartir también en Facebook" al subir.
- **Highlights** → solo IG. FB usa su propia portada (1640×624) en [`personal/covers/fb-cover.png`].
- **Reordenar highlights** → IG ordena por última Story añadida (más reciente = posición 1). Para reordenar, sube las Stories en **orden inverso** al deseado y añádelas al highlight.

## Operativa diaria

1. Abrir [`PLAN.md`](PLAN.md).
2. Mirar **En producción** → si hay pieza para hoy, abrir su carpeta `personal/NNNN-...` → en `captions.md` está todo lo necesario para subir.
3. Subir.
4. Mover entrada de "En producción" a "Publicado" en `PLAN.md` (referenciar por número).
