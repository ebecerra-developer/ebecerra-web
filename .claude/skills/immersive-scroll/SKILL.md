---
name: immersive-scroll
description: Efecto web inmersivo "ir hacia delante" — fondo POV (secuencia de fotogramas en canvas) que avanza con el scroll + escenas centradas que se cruzan con cross-fade. Úsalo al crear o tocar experiencias scroll-driven de este tipo (la plantilla `expedicion`/Bravío en apps/demos, o nuevas), o al replicar los prototipos de `_immersive-proto`. Cubre el motor, el modelo desktop vs móvil (paneo) y los GOTCHAS caros aprendidos.
---

# Immersive scroll — efecto "ir hacia delante"

Experiencia donde el contenido NO scrollea como un documento: un **fondo POV** (metraje de senderismo como secuencia de fotogramas dibujada en `<canvas>`) **avanza con el scroll**, y encima aparecen **escenas centradas que se cruzan con cross-fade**. Sensación de avanzar por un camino. Degrada con dignidad a scroll normal si el dispositivo no puede.

## Dónde vive

- **Prototipos de referencia** (estáticos, fuera del deploy): `docs/immersive-proto/` — solo **3 técnicas distintas**: `index.html` (fly-through procedural en canvas), `v3.html` (parallax fotográfico), `v6.html` (Gaussian Splatting de un lugar real, vía Luma). El prototipo del efecto de producción (POV + frames, antiguo `v7`) ya NO se guarda: vive en la demo Bravío (`apps/demos`). Se descartaron v2/v4/v4b/v5/v7 + las secuencias de frames (~12 MB). Antes estaban en `apps/es/public/_immersive-proto/` (Next los servía en prod) → movidos. Ver `docs/immersive-proto/README.md`.
- **Catálogo de OTROS efectos de motion/scroll** (candidatos a futuras demos o a `apps/es`: revelado con cursor, personaje por scroll, stacking cards, marquee divergente, parallax de nubes, coverflow, coreografía de secciones fijadas): `docs/motion-effects-catalog.md` — con técnica (CSS scroll-timeline vs GSAP vs canvas), coste, móvil y dónde encaja cada uno.
- **Producción**: plantilla `expedicion` (marca demo **Bravío**, slug `bravio`) en `apps/demos/components/templates/expedicion/`. Motor: **`ExpedicionImmersiveStage.tsx`** (+ `.module.css`). Es una plantilla de `apps/demos` → ver también `/demos-template-system`.

## El motor (cómo funciona)

- **Capas FIJAS** (`position:fixed; inset:0`): `poster` (fallback) → `canvas` (metraje) → `grade` (velo oscuro para legibilidad) → `frame` (marquito: líneas + esquinas) → `scenes` (las escenas). Cubren siempre el viewport.
- **`spacer`**: un div alto (`N*120vh` aprox.) que da la DISTANCIA de scroll. El progreso sale de él:
  `p = clamp(-spacer.getBoundingClientRect().top / (spacer.offsetHeight - innerHeight), 0, 1)`.
- **Un solo `rAF` on-demand**: despierta con el scroll (`wake()`), duerme al converger. Dibuja el fotograma `≈ p*(FRAME_COUNT-1)` en el canvas (cover) y fija opacidad/transform de cada escena con `sceneVis(p, idx)` (meseta + fundido en los bordes de su tramo).
- **Canvas image-sequence**, NO vídeo: fotogramas WebP (~29 KB c/u, ~93 frames ≈ 2.8 MB) precargados; se scrubean con el scroll. Un `<video>` da saltos al hacer seek; los fotogramas no.
- **Mejora progresiva**: SSR/fallback = `data-mode="normal"` (scroll normal, mismo DOM). El inmersivo se activa SOLO en cliente si hay capacidad (no `prefers-reduced-motion`, no `save-data`, ventana no demasiado baja) y tras precargar unos fotogramas. `mode` por `useState` → sin hydration mismatch.
- **a11y**: escenas inactivas `inert` + `visibility:hidden`; la activa quita `inert`. Skip-link, focus rings de doble anillo sobre el metraje.
- **Parallax de cursor** (solo ratón fino): un `pointermove` mueve el "punto de vista" — las ramas de primer plano se desplazan MÁS (`PAR_BRANCH`) que el contenido de las escenas (`PAR_SCENE`), opuesto al cursor → profundidad. Suavizado con lerp en el loop; el desplazamiento va ANTES del `scale` de la rama (sigue creciendo desde su borde, no se despega). El loop no se duerme hasta que el parallax converge.

## Dos modelos de tamaño — la clave, POR ORIENTACIÓN (no por ancho)

El inmersivo se activa **en todas las orientaciones** (el user lo quiere "en todo"). El modelo se elige por ORIENTACIÓN, no por ancho de pantalla:
`isMobile = portrait && ((pointer:coarse) || (max-width:900px))`.

- **PORTRAIT (vertical) → modelo PANEO** (`isMobile=true`, clase `html.exp-mobile`): MISMO cross-fade, pero meter 5 tarjetas + formulario en una pantalla legible es imposible → cada sección recibe **distancia de scroll proporcional a su alto** y **PANEA** verticalmente (la `<section>` se traslada dentro del marco fijo), revelando su contenido sin recortes; el **cross-fade se reserva para el paso ENTRE secciones**. Reparto con `bounds[]`/`panDist[]` ponderados por alto (`layout()`). (Se probó un modo "flow" = fondo avanza + scroll normal; RECHAZADO.)
- **LANDSCAPE + DESKTOP → modelo ESCALA** (`isMobile=false`): una sección = UNA pantalla; `fitScenes()` **solo REDUCE** una escena si a 100% no cabe; nunca agranda. **Por qué landscape va aquí y no en paneo:** el paneo en una ventana muy baja (móvil horizontal ~390px de alto) hace el spacer gigantesco → scroll lentísimo + "teletransportes" al cambiar de dirección. El modelo de escala da scroll proporcional y limpio.
- **Recargar al ROTAR**: el modelo se decide al montar; un `matchMedia("(orientation: portrait)").onchange → location.reload()` reinicia limpio al girar (arranca arriba por `scrollRestoration:manual`).
- **Alto interior del marco** (sizing y paneo): `innerH − (nav.offsetHeight+10) − inset − margin`. `offsetHeight` del nav **ignora barras de preview** (franja "DEMO").

### Móvil HORIZONTAL: reflows de contenido (el modelo escala lo aplastaría)

En un móvil en horizontal el alto útil del marco es ~270–290px. El modelo de escala mete las secciones altas a `scale ~0.2–0.3` → **texto de 3px, ilegible** (medido: actividades 0.29, contacto 0.21). NO caer a scroll normal (el user quiere el inmersivo); en su lugar **reflow del contenido a horizontal** para que quepa a `scale ~0.7–1` legible:

- Patrón: `@media (orientation: landscape) and (max-height: 560px) { :global(html.exp-immersive) .grid { … } }`. Las altas pasan a UNA fila (actividades 5-col, guías/opiniones 3-col), contacto a 2-col (info | form), experiencia a bullets 2-col; se ocultan leads/notas redundantes y se acotan descripciones con `-webkit-line-clamp`. Resultado medido: todas a 0.63–1.15.
- **Scopear bajo `:global(html.exp-immersive)`** es OBLIGATORIO por DOS razones: (a) **especificidad** — las reglas de compactado `html.exp-immersive .x` (0,2,1) ganan a un `.x` pelado en media query (0,1,0), así que el reflow debe igualar el scope o no aplica; (b) **solo en inmersivo** — en el fallback de scroll normal la página es larga y NO debe reflowear.
- `max-height:560` separa móvil-landscape (~360–430px) de **tablet-landscape (~768px, que NO debe reflowear**: ya cabe a 0.8+ con su layout original). Verificado que portrait (paneo) y tablet-landscape (layout original) no se tocan.
- Para saber qué escenas necesitan reflow: medir `section.scrollHeight` natural a ese viewport y `scale = availH / natural`; tratar las < ~0.7. El `nav` también se baja a 52px en landscape para recuperar alto (`frameInteriorH` lee `nav.offsetHeight`).

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
