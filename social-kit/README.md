# social-kit

Toolbox local para generar contenido de Instagram + Facebook para ebecerra.es.

> **Antes de producir nada**, abre [`PLAN.md`](PLAN.md). Es la fuente única de verdad: backlog, qué se está produciendo, qué se ha publicado, qué temas están en cooldown.

---

## Tres archivos de gobernanza

| Archivo | Para qué |
|---|---|
| [`PLAN.md`](PLAN.md) | Backlog de ideas, en producción, log de publicado, cooldown de temas, cadencia. **Editar cada vez que se publica algo.** |
| [`CATEGORIES.md`](CATEGORIES.md) | Las 5 categorías de contenido + anti-patrones. No publicar dos seguidas de la misma categoría. |
| [`README.md`](README.md) | Este archivo — solo estructura técnica y comandos. |

Skill canónica con paleta, tamaños, workflow Playwright y captions: [`~/.claude/skills/social-media-kit/SKILL.md`](../../../.claude/skills/social-media-kit/SKILL.md).

---

## Estructura

```
social-kit/
├── PLAN.md                                    Backlog + producción + publicado + cooldown
├── CATEGORIES.md                              5 categorías + anti-patrones
├── README.md                                  (este archivo)
├── package.json                               playwright + ffmpeg-static
│
├── _templates/                                FUENTES HTML reutilizables
│   ├── carruseles/<concepto>/                 Cada slide es un HTML + _base.css compartido
│   │   ├── 4-demos/                           "4 demos, 4 tipos de cliente" (7 slides)
│   │   └── senales/                           "5 señales de que tu web necesita…"
│   ├── posts/
│   │   ├── lo-que-no-hago.html                1080×1350 fondo verde
│   │   └── gbp-cover.html                     Google Business Profile cover 2048×1080
│   ├── stories/
│   │   ├── story-eco.html                     Estática (anuncio demo eco)
│   │   ├── story-chatbot.html                 Animada (12s, conversación captura lead)
│   │   ├── story-pruebalos.html               Estática (5 webs · 5 chatbots)
│   │   └── (legados migrados: contacto, servicios, webs)
│   ├── highlights/                            Portadas de destacados 1080×1920 (5 plantillas)
│   ├── extract-eB-white.html                  Canvas → eB blanco transparente
│   ├── invert-avatar.html                     Canvas → eB verde sobre crema
│   └── scripts/                               AUTOMATIZACIÓN Node
│       ├── capture-demos.mjs                  Captura los 4 demos vivos (sin DemoBanner)
│       ├── render-statics.mjs                 Renderiza todos los PNGs estáticos
│       └── record-chatbot.mjs                 Graba la story chatbot a MP4 (12s @ 30fps)
│
├── personal/                                  BINARIOS FINALES para ebecerra.es
│   ├── avatars/                               Logos eB (SVGs + variantes PNG)
│   ├── logos/                                 Bracket-B SVGs (uso restringido — no para autónomos)
│   ├── captures/                              Capturas crudas de demos + ebecerra.es/.tech
│   ├── posts/                                 PNGs finales por formato
│   ├── carruseles/<nombre>/slide-N.png
│   ├── stories/                               PNGs + MP4 + posters
│   ├── highlights/                            Portadas destacados (PNG 1080×1920)
│   ├── covers/                                fb-cover.png, otros covers permanentes
│   └── YYYY-MM-DD/                            PUBLICATION RECORD por fecha
│       └── captions.md                        Captions + alts + comentarios + stickers + música
│
└── piezas/                                    Cuenta separada (Piezas Game) — NO mezclar
    ├── logos/
    ├── captures/
    └── posts/
```

**Reglas de carpeta:**

- Los **binarios finales** viven en `personal/<tipo>/` (posts, stories, carruseles, covers, etc.). Los scripts Node escriben aquí.
- Las **carpetas con fecha** `personal/YYYY-MM-DD/` son **publication records**: contienen solo `captions.md` (con captions + alts + comentarios fijados + stickers + música) que referencia los binarios por su ruta. **No duplicar binarios.**
- Los **`_templates/`** son fuentes reutilizables. Una plantilla nueva se añade aquí solo si es genuinamente reutilizable; si es one-off, va directo a render.

---

## Regenerar contenido existente

```bash
cd _templates/scripts
node capture-demos.mjs      # actualiza capturas de demos.ebecerra.es
node render-statics.mjs     # PNGs estáticos (slides + posts + stories)
node record-chatbot.mjs     # vídeo chatbot 12s
```

---

## Operativa diaria

1. Abrir [`PLAN.md`](PLAN.md).
2. Mirar **En producción** → si hay algo planeado para hoy, producir.
3. Si no, mirar **Backlog** + **Cooldown** + última categoría publicada → elegir nueva pieza respetando las reglas.
4. Producir templates HTML + ejecutar scripts Node.
5. Crear `personal/YYYY-MM-DD/captions.md` con captions + alts + comentarios + stickers + música.
6. Publicar.
7. Mover entrada de **En producción** a **Publicado** en PLAN.md.
8. Si surge idea nueva durante el día → al Backlog en bruto.

---

## Notas técnicas

- `social-kit/` queda fuera de git (gitignore lo cubre).
- Capturas de demos contra producción `https://demos.ebecerra.es` — el script ya inyecta CSS para ocultar el DemoBanner.
- ffmpeg viene de `ffmpeg-static` (npm), no requiere instalación global. Playwright tiene su propio ffmpeg pero solo soporta VP8/WebM; para MP4 (Instagram) se usa el de `ffmpeg-static`.
- Cross-post a Facebook: posts automático, stories marcar manual, highlights solo IG (FB usa cover 1640×624 en `personal/covers/`).
