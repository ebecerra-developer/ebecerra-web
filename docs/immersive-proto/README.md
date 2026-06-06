# Prototipos de efecto inmersivo (referencia)

Exploraciones estáticas del efecto "ir hacia delante" (scroll inmersivo). Se
guardan **como referencia para futuras versiones**; NO se sirven en producción
(antes vivían en `apps/es/public/_immersive-proto/`, que Next servía en
`ebecerra.es/_immersive-proto/...` — se movieron aquí, fuera del deploy).

Para verlos: abrir el `.html` directamente en el navegador. Dependen de CDNs
(three.js, lenis, y según el caso picsum / Luma) → necesitan conexión.

## Los que se guardan (3 técnicas distintas)

| Archivo | Técnica | Notas |
|---|---|---|
| `index.html` | Fly-through procedural en `<canvas>` (three.js) — geometría dibujada, sin assets | Base del concepto. Autocontenido. |
| `v3.html` | Parallax fotográfico: capas de fotos con profundidad que se separan con el scroll | Usa `picsum.photos` como placeholder de las fotos. |
| `v6.html` | **Gaussian Splatting** de un lugar real (captura Luma AI, cargada desde `lumalabs.ai`) | Técnica 3D radicalmente distinta a la secuencia de frames — por eso se conserva. |

## Lo que se descartó (y por qué)

- **v7** (POV: secuencia de frames en canvas + parallax de follaje) → es **la técnica
  que ya está en producción** en la demo **Bravío** (`apps/demos`, plantilla
  `expedicion`, motor `ExpedicionImmersiveStage`). El código de producción es la
  referencia viva; el prototipo sobraba.
- **v4b** (scrubber de secuencia de imágenes) → misma familia que v7/Bravío.
- **v2, v4, v5** → variantes intermedias / descartadas (v5 = parallax de muchas
  imágenes, rechazado).
- **`frames/` (150 jpg) y `frames-pov/` (160 jpg), ~12 MB** → solo las usaban v4b y v7.

Detalle del motor y los gotchas en el skill `/immersive-scroll`.
