---
name: immersive-scroll
description: Efecto web inmersivo "ir hacia delante" — fondo POV (secuencia de fotogramas en canvas) que avanza con el scroll + escenas centradas que se cruzan con cross-fade. Úsalo al crear o tocar experiencias scroll-driven de este tipo (la plantilla `expedicion`/Bravío en apps/demos, o nuevas), o al replicar los prototipos de `_immersive-proto`. Cubre el motor, el modelo desktop vs móvil (paneo) y los GOTCHAS caros aprendidos.
---

# Immersive scroll — efecto "ir hacia delante"

Experiencia donde el contenido NO scrollea como un documento: un **fondo POV** (metraje de senderismo como secuencia de fotogramas dibujada en `<canvas>`) **avanza con el scroll**, y encima aparecen **escenas centradas que se cruzan con cross-fade**. Sensación de avanzar por un camino. Degrada con dignidad a scroll normal si el dispositivo no puede.

## Dónde vive

- **Prototipos** (estáticos, para explorar variantes): `apps/es/public/_immersive-proto/` — `index.html`, `v2`–`v7`. Los buenos: **v3, v4b, v7** (POV + cross-fade de escenas). `v5` es un parallax de muchas imágenes (descartado). `frames/` y `frames-pov/` son las secuencias.
- **Producción**: plantilla `expedicion` (marca demo **Bravío**, slug `bravio`) en `apps/demos/components/templates/expedicion/`. Motor: **`ExpedicionImmersiveStage.tsx`** (+ `.module.css`). Es una plantilla de `apps/demos` → ver también `/demos-template-system`.

## El motor (cómo funciona)

- **Capas FIJAS** (`position:fixed; inset:0`): `poster` (fallback) → `canvas` (metraje) → `grade` (velo oscuro para legibilidad) → `frame` (marquito: líneas + esquinas) → `scenes` (las escenas). Cubren siempre el viewport.
- **`spacer`**: un div alto (`N*120vh` aprox.) que da la DISTANCIA de scroll. El progreso sale de él:
  `p = clamp(-spacer.getBoundingClientRect().top / (spacer.offsetHeight - innerHeight), 0, 1)`.
- **Un solo `rAF` on-demand**: despierta con el scroll (`wake()`), duerme al converger. Dibuja el fotograma `≈ p*(FRAME_COUNT-1)` en el canvas (cover) y fija opacidad/transform de cada escena con `sceneVis(p, idx)` (meseta + fundido en los bordes de su tramo).
- **Canvas image-sequence**, NO vídeo: fotogramas WebP (~29 KB c/u, ~93 frames ≈ 2.8 MB) precargados; se scrubean con el scroll. Un `<video>` da saltos al hacer seek; los fotogramas no.
- **Mejora progresiva**: SSR/fallback = `data-mode="normal"` (scroll normal, mismo DOM). El inmersivo se activa SOLO en cliente si hay capacidad (no `prefers-reduced-motion`, no `save-data`, ventana no demasiado baja) y tras precargar unos fotogramas. `mode` por `useState` → sin hydration mismatch.
- **a11y**: escenas inactivas `inert` + `visibility:hidden`; la activa quita `inert`. Skip-link, focus rings de doble anillo sobre el metraje.

## Desktop vs Móvil — la clave de tamaño

- **Desktop** (`(min-width:901px)` y alto suficiente): una sección = UNA pantalla. `fitScenes()` **solo REDUCE** una escena si a 100% no cabe en el marco; nunca agranda ni toca una que ya cabe.
- **Móvil/táctil** (`(pointer:coarse), (max-width:900px)`): MISMO modelo cross-fade, pero meter 5 tarjetas + formulario en una pantalla legible es imposible → cada sección recibe **distancia de scroll proporcional a su alto** y **PANEA** verticalmente (la `<section>` se traslada de su parte de arriba a la de abajo dentro del marco fijo), revelando su contenido sin recortes; el **cross-fade se reserva para el paso ENTRE secciones**. Reparto con `bounds[]`/`panDist[]` ponderados por alto (`layout()`). Es "1 pantalla desktop = varias en móvil" sin marcadores manuales. (Se probó un modo "flow" = fondo avanza + scroll normal; RECHAZADO, se quiere el cross-fade también en móvil.)
- **Alto interior del marco** (compartido por sizing y paneo): `innerH − (nav.offsetHeight+10) − inset − margin`. Se usa `offsetHeight` del nav para **ignorar barras de preview** (la franja "DEMO") que empujan el nav pero no existen en producción.

## GOTCHAS (oro — esto es lo que cuesta descubrir)

1. **`sticky`/`overflow` capturan la rueda.** Un contenedor `position:sticky` o con `overflow` en el stage ATRAPA el `wheel` y la ventana no scrollea. Por eso el modelo es capas FIJAS + spacer alto. No lo cambies a sticky.
2. **`scroll-behavior:smooth` global rompe el scroll por JS.** Si el scroll animado hace `window.scrollTo(0,y)` 60×/s y el `<html>` tiene `scroll-behavior:smooth`, la forma de 2 args respeta el smooth y CADA frame reinicia la animación nativa → el scroll se ATASCA (síntoma típico: el click del nav "no hace nada"). Fix: al activar, `document.documentElement.style.scrollBehavior="auto"` INLINE (gana a la hoja) + limpiar al desmontar.
3. **Medir alturas DESPUÉS de fuentes/imágenes o el tamaño baila entre recargas.** Si mides con la fuente de sistema y luego carga la webfont (Oswald condensada mide distinto), o antes de que las imágenes reflowen, la escala/paneo sale distinto según el orden de carga (caché) → "a veces grande, a veces pequeño sin tocar código". Fix: **gatear la activación a `document.fonts.ready`** + un **`ResizeObserver`** sobre cada `<section>` que re-mida (debounced a rAF). Converge siempre al tamaño correcto.
4. **La línea del marco debe seguir al nav, pero el contenido se centra en el marco.** `--frame-top` = `nav.getBoundingClientRect().bottom + 10` (DINÁMICO en el loop) → el marco se adapta: más pequeño con barra de preview, más grande al hacer scroll → la línea nunca cruza el texto del nav. La escena se centra usando `--frame-top` (padding) → aire igual arriba/abajo dentro del marco.
5. **PNG de primer plano (ramas/parallax) que se cortan.** Si la caja del PNG es estrecha (p.ej. 46% ancho), el `background` se recorta con una línea visible dentro del viewport. Fix: que el PNG **llene la dimensión de su borde** (`background-size: auto 100%` para izq/der, `100% auto` para arr/abj) en una caja MUY grande en la otra dimensión (≈240%) → lo que sobra sale FUERA de pantalla, sin línea de corte. Anclar al borde + `transform-origin` ahí (crece desde el borde al escalar = parallax).
6. **Arranque rápido + sin "salto".** Activar con POCOS fotogramas (≈10; el póster cubre lo que falta, el resto carga en 2º plano) en vez de esperar a los 93. Fundido de entrada CSS (`@keyframes` sobre canvas/frame/scenes, SIN `forwards` para no pisar el `opacity: var(--stage-fade)` del fundido de footer).
7. **a11y en scroll-jacking.** (a) SIEMPRE una escena no-inert (la más visible, sin umbral; si exiges `vis>0.5` quedan TODAS inert a mitad de cross-fade y el foco cae al body). (b) NUNCA inertar la escena que contiene `document.activeElement` (al enfocar un control, el `scrollIntoView` despierta el rAF y se perdería el foco). (c) Los CTAs con `box-shadow` propia PISAN el `:focus-visible` global → añadir `:focus-visible { box-shadow: var(--sh-focus) }` en cada uno (mayor especificidad). (d) Verifica el foco con **Tab real** (no `.focus()`, que no dispara `:focus-visible`).
8. **Fundido de salida hacia el footer.** Al final, toda la capa inmersiva sube y se desvanece (`--stage-shift` + `--stage-fade`) para que el footer (bloque normal, fuera del stage, z-index por encima) suba sobre el fondo oscuro como un pie tradicional.

## Pruebas — no dispares el bucle de HMR

El MCP de Playwright escribe logs en `.playwright-mcp/` (raíz del proyecto) y las capturas, si caen en la raíz, las vigila Next (HMR) → **reconstruye en bucle y resetea el scroll/estado** (tests eternos). Escribe capturas SIEMPRE a `c:/temp`, minimiza el nº de llamadas, y usa aserciones atómicas (scroll + lectura en un solo `evaluate`). `.playwright-mcp/` y `*.jpeg` están en `.gitignore`.

## Reutilizar el efecto en otra plantilla/sitio

El motor está acoplado a `expedicion`. Para reusar: copia `ExpedicionImmersiveStage.tsx`+`.module.css` y los tokens, mete tu secuencia de fotogramas en `public/.../frames/`, y pásale como `children` las escenas (cada hijo = una escena; en móvil las altas panean solas). Mantén los gotchas 1–8.
