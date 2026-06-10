# Catálogo de efectos de motion / scroll — repertorio para demos

Banco de efectos visuales scroll-driven e interactivos para usar como **argumento comercial** ("webs a medida con motion", no plantillas copy-paste). Inspiración: [motionsites.ai](https://motionsites.ai/) (ver memoria `reference_motionsites_inspiration`). Cada efecto está pensado para **encajar en una demo de `apps/demos` (cada una su plantilla, ver `/demos-template-system`), en `ebecerra.es`, o en una demo nueva** — NO para meterlos todos en Bravío (Bravío se queda como está).

> Regla de oro: el efecto sirve a la historia del avatar, no al revés. Mobile-first y `prefers-reduced-motion` SIEMPRE (degradar a estático). Medir peso: un efecto bonito que tira el LCP no vale para `apps/es` (comercial).

---

## Dos vías de implementación (elegir por efecto)

| Vía | Cuándo | Coste | Notas |
|---|---|---|---|
| **CSS scroll-driven animations** nativas (`animation-timeline: scroll()` / `view()`, `scroll-timeline`) | Efectos ligados a progreso de scroll SIN secuencias complejas: parallax, fades, apilados, marquees | 0 KB, corre fuera del hilo principal (no jank) | ~85% soporte (2026); Firefox tras flag → **fallback estático** con `@supports`. La opción por defecto para lo ligero. |
| **GSAP ScrollTrigger** | Pinning + secuencias encadenadas, scrub fino, "scroll storytelling", coordinación entre escenas | +25 KB gz | Lo que ya hace el motor de Bravío a mano (canvas). Para coreografías serias. `pin`, `scrub`, `markers` para depurar. |
| **Canvas / WebGL (three.js)** | Secuencia de frames POV, 3D real, Gaussian Splatting | medio/alto | Bravío (frames) + prototipos `index`/`v6` en `docs/immersive-proto/`. |
| **JS mínimo + CSS vars** | Seguir el cursor (`pointermove` → `--x/--y`) | ~0 | Para reveals/parallax de ratón (como el parallax de cursor de Bravío). |

Pista: empezar SIEMPRE por la vía más barata que logre el efecto. Subir a GSAP solo cuando la coreografía lo exija.

---

## A) Lo que YA tenemos (repertorio actual)

| Efecto | Dónde vive | Técnica |
|---|---|---|
| **POV inmersivo** (metraje que avanza con scroll + escenas cross-fade + parallax de follaje con cursor) | Bravío (`apps/demos`, plantilla `expedicion`). Skill `/immersive-scroll` | Canvas image-sequence + capas fijas + spacer. Modelo por orientación (paneo/escala). |
| **Fly-through procedural** | prototipo `docs/immersive-proto/index.html` | three.js, geometría dibujada (sin assets) |
| **Parallax fotográfico** (capas de foto con profundidad) | prototipo `docs/immersive-proto/v3.html` | three.js + scroll |
| **Gaussian Splatting** (lugar real en 3D) | prototipo `docs/immersive-proto/v6.html` | Luma `@lumaai/luma-web` + three.js |
| **Marquee, TiltCard, fx-ripple, rough-notation** (anotaciones a mano) | `apps/es` (rediseño 2.0) | CSS + lib `rough-notation` |

---

## B) Efectos NUEVOS a incorporar (los 7 propuestos)

### 1. Revelado con el cursor — "linterna / spot-the-difference"
**Qué:** dos imágenes casi iguales superpuestas; por donde pasa el cursor se "abre un agujero" que muestra la de detrás (revelar diferencias, o un antes/después).
**Cómo:** capa superior con `mask-image: radial-gradient(circle, transparent, black)` posicionada en `--mx/--my` (un `pointermove` actualiza dos CSS vars). Alternativa más rica: `<canvas>` con `globalCompositeOperation = 'destination-out'` pintando el "haz". Sin librería.
**Coste/dificultad:** bajo. **Móvil:** sin cursor → degradar a slider antes/después (arrastrar) o a auto-barrido.
**Dónde encaja:** **antes/después** de fisio/dental/reformas (tratamiento, obra); teaser lúdico (conecta con el juego Tranqui Diferencias). 

### 2. Personaje animado por el scroll — "el conejo que pedalea"
**Qué:** un elemento fijo (personaje/objeto) cuya animación avanza CON el scroll (el conejo pedalea mientras el texto sube); sensación de "yo muevo la escena".
**Cómo:** sprite-sheet con `animation-timeline: scroll()` + `animation-timeline-range` y `steps(n)` (CSS puro), o GSAP ScrollTrigger `scrub` sobre una SVG (animar `stroke-dashoffset`/transformaciones de las piezas). Para un personaje articulado, SVG con piezas nombradas.
**Coste/dificultad:** medio (depende del arte del personaje). **Móvil:** funciona igual (ligado a scroll, no a cursor).
**Dónde encaja:** marca personal joven/lúdica (coach-vibrant), servicios family/kids/educación, o un **guiño de autor en `ebecerra.es`** (un detalle de personalidad, sin pasarse).

### 3. Coreografía de secciones fijadas — "relevo de secciones"
**Qué:** lo que describiste: la sección de arriba se va por arriba mientras la de abajo se mantiene fija; cuando la de arriba desaparece, la de abajo se desliza y aparece otra nueva en medio. Storytelling por capas.
**Cómo:** GSAP ScrollTrigger con `pin` + un timeline secuenciado (cada bloque ocupa un tramo del scroll). Es primo del motor de Bravío pero con DOM en vez de canvas. Versión ligera de "pin + reveal" con `position: sticky` + `view-timeline` si la secuencia es simple.
**Coste/dificultad:** alto (coordinación). **Móvil:** cuidado con el alto; o se simplifica a fades por sección (como hace Bravío en vertical).
**Dónde encaja:** demo premium/editorial (coach-editorial, abogados, arquitectura); o el bloque **"Cómo trabajamos" de `ebecerra.es`** contado paso a paso.

### 4. Filas en direcciones opuestas por scroll — "marquee divergente"
**Qué:** dos filas de fotos/logos; al hacer scroll una se desplaza a la izquierda y la otra a la derecha (o aceleran con la velocidad del scroll).
**Cómo:** CSS `animation-timeline: scroll()` traduciendo cada fila en sentido opuesto (0 JS), o GSAP + velocidad de scroll para el efecto "tira y afloja". Es el marquee que ya usamos en `apps/es`, pero **ligado al scroll**.
**Coste/dificultad:** bajo. **Móvil:** perfecto (no depende de cursor).
**Dónde encaja:** galería/portfolio, "marcas con las que trabajo", ecommerce; el bloque **"Ejemplos" de `ebecerra.es`** o una demo de agencia.

### 5. Secciones que se apilan / solapan — "stacking cards"
**Qué:** las secciones se quedan pegadas y se van apilando una sobre otra (con escala/sombra) según bajas.
**Cómo:** `position: sticky` + `top` escalonado + escala con `animation-timeline: view()` (hay demo nativa en scroll-driven-animations.style), o GSAP `pin`. De los efectos más rentables (mucho impacto, poco coste).
**Coste/dificultad:** bajo. **Móvil:** funciona; ajustar alturas.
**Dónde encaja:** tiers de **pricing**, tarjetas de servicios, pasos de proceso — cualquier demo, y candidato para `apps/es` (Servicios).

### 6. Parallax de cielo + nubes con capa auto-animada
**Qué:** foto separada en capas (cielo / nubes / primer plano); las nubes derivan solas con animación continua mientras el conjunto hace parallax con el scroll → profundidad + vida.
**Cómo:** capas con `transform: translateY()` por `scroll-timeline` (parallax) + las nubes con un `@keyframes` de deriva infinita (independiente del scroll). Recortes PNG/WebP con alpha (como las ramas de Bravío).
**Coste/dificultad:** bajo-medio (depende del recorte de capas). **Móvil:** ok (reducir amplitud).
**Dónde encaja:** turismo/eventos/bodas, **wellness/spa** (cielo tranquilo para fisio calmada), inmobiliaria, infantil.

### 7. Carrusel de profundidad — "coverflow" (2 detrás, 1 delante)
**Qué:** carrusel muy visual donde la pieza central manda y dos quedan detrás/a los lados con perspectiva.
**Cómo:** transforms 3D (`perspective` + `rotateY` + `translateZ`) con índice en JS, o Swiper modo `coverflow` (si compensa la dependencia). Avance por flechas/drag/auto.
**Coste/dificultad:** medio. **Móvil:** swipe nativo (encaja muy bien).
**Dónde encaja:** portfolio fotográfico, producto/ecommerce, testimonios destacados, menú de restaurante.

---

## C) Recomendaciones (qué, dónde, en qué orden)

### Añadir a demos ACTUALES (bajo riesgo, alto retorno)
- **Stacking cards (5)** en una demo con pricing/servicios → impacto inmediato, casi gratis.
- **Marquee divergente (4)** en una galería existente.
- **Antes/después con cursor (1)** encaja natural en **fisio** (lesión→recuperación) o si algún día hay demo de reformas/dental.

### `ebecerra.es` (con cabeza — es comercial, cuidar LCP)
- Un **toque de autor**: o bien la coreografía "relevo de secciones" (3) en *Cómo trabajamos*, o un **personaje por scroll** (2) discreto. Solo UNO, sutil, con fallback. Nada que penalice rendimiento ni distraiga del CTA.
- **Stacking cards (5)** en Servicios es la apuesta más segura.

### Demos NUEVAS donde el efecto ES el gancho (cada una su carril visual)
- **Spa / wellness premium** → cielo+nubes (6) + paleta calma. Avatar distinto a fisio (clínico) — lujo sereno.
- **Turismo / hotel / casa rural / eventos-bodas** → cielo+nubes (6) + coverflow (7) de estancias/espacios. Posible **Gaussian Splatting (v6)** de un lugar real = factor sorpresa.
- **Inmobiliaria / reformas** → antes/después con cursor (1) + Gaussian Splatting (v6) de un piso reformado.
- **Restaurante / gastronomía** → coverflow (7) de platos + secciones que se solapan (5) + marquee divergente (4) de la carta.
- **Marca personal creativa / fotógrafo** → coverflow (7) + relevo de secciones (3).
- **Infantil / educación / familiar** → personaje por scroll (2, "el conejo") como firma.

### Orden sugerido de prototipado
1. Los baratos y reutilizables primero: **stacking cards** y **marquee divergente** (CSS scroll-timeline puro) → quedan como "secciones de catálogo" para cualquier demo.
2. **Antes/después con cursor** (lúdico y comercial, conecta con Tranqui Diferencias).
3. Una **demo nueva con gancho** (spa o turismo) que combine cielo+nubes + coverflow.
4. Lo caro/coreografiado (relevo de secciones, personaje por scroll) cuando haya un encargo o demo que lo justifique.

---

## Referencias
- [Codrops / Tympanus](https://tympanus.net/codrops/) — tutoriales 2026: [Sticky Grid Scroll](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/), [SVG Mask Transitions on Scroll (GSAP)](https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/), [Scroll-driven SVG Map (GSAP)](https://tympanus.net/codrops/2026/05/21/creating-scroll-driven-svg-map-animations-with-gsap/).
- [scroll-driven-animations.style](https://scroll-driven-animations.style/) — demos nativas (incl. [stacking cards CSS](https://scroll-driven-animations.style/demos/stacking-cards/css/)).
- [MDN — Scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) · [animation-timeline: scroll()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline/scroll) · [caniuse css-scroll-timeline](https://caniuse.com/css-scroll-timeline).
- [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) · [60+ ScrollTrigger examples](https://freefrontend.com/scroll-trigger-js/).
- [Josh W. Comeau — Scroll-Driven Animations](https://www.joshwcomeau.com/animation/scroll-driven-animations/) (intro clara).
- [Chrome — CSS scroll-triggered animations (Chrome 145, 2026)](https://developer.chrome.com/blog/scroll-triggered-animations).
