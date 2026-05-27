# 0024 · TRÍPTICO · "Una web es un currante más en tu equipo."

- **Tipo**: 3 posts feed 1080×1350 (4:5), generados desde un panorama único 3240×1350 con clip pixel-perfect en Playwright
- **Estado**: para publicar miércoles 2026-05-28 — los 3 posts seguidos en orden inverso
- **Categoría**: diferenciación / capacidades · manifiesto
- **Outputs**: `panorama-full.png` (3240×1350, referencia) + `panel-1.png`, `panel-2.png`, `panel-3.png`
- **Cierra arco temático** del Reel 0023 ("Una web bien montada es un currante más en tu equipo") + Story 0022 (qué quieres que tu web haga por ti)

## ⚠️ Operativa de subida — ORDEN INVERSO

IG llena el grid del perfil con los posts más nuevos arriba a la izquierda. Para que en el grid aparezcan **alineados izquierda → derecha** como mural:

| # subida | Archivo | Posición final en grid |
|---|---|---|
| 1º (primero) | [`panel-3.png`](panel-3.png) | columna derecha de la fila top |
| 2º | [`panel-2.png`](panel-2.png) | columna centro |
| 3º (último) | [`panel-1.png`](panel-1.png) | columna izquierda |

**Espaciar las subidas** ~30-60 minutos entre cada una para que aparezcan como posts distintos en feed (no spam). Cada uno con su caption propia (abajo). Los 3 cross-postean a FB automáticamente.

## Captions por panel

### Panel 3 — sube PRIMERO

```
en tu equipo.

(parte 3 de 3 — al perfil para ver el mural completo)

Tu web no es una valla.
Es la persona que contesta cuando tú no puedes,
la que reserva citas cuando tú duermes,
la que captura el lead que llegó a las 8:34 a.m.

Una web bien montada es eso.
Un currante más en tu equipo.

DM si quieres una así.

#webparaempresas #autonomosespana #pymeespaña
```

### Panel 2 — sube SEGUNDO

```
un currante más.

(parte 2 de 3 — sigue arriba en el grid)

No es vallas publicitarias.
No es plantillas. No es vitrinas digitales.

Una web que merece la pena trabaja contigo.
Y trabaja sola cuando tú estás fuera.

Sigue al perfil para ver las 3 piezas juntas.

#manifiesto #freelancespain #marketingdigital
```

### Panel 1 — sube ÚLTIMO

```
Una web es…

(parte 1 de 3 — al perfil para ver el mural completo)

Cierro hilo:
hace meses dije que mis webs no eran vallas publicitarias.

Eran (son) compañeras de trabajo.
Tu web debería responder, agendar, vender y filtrar mientras tú vives.

Si te encaja para tu negocio, DM. Sin compromiso, ya sabes.

#webparaempresas #autonomosespana #pymeespaña
```

## Alt text (común a los 3, ajustar el último frame)

```
Pieza tipográfica editorial sobre fondo crema cálido. Texto serif grande Fraunces formando un manifiesto: "Una web es un currante más en tu equipo." La palabra "más" destacada en italic verde sage con subrayado, "currante" arriba en serif normal walnut, "equipo." con punto verde de cierre. Marco editorial con líneas horizontales superior e inferior, eyebrows pequeños "MANIFIESTO" y "NO. 001". Handle @ebecerra.es con monograma eB al pie derecho. Esta es la parte [1/2/3] de un mural compuesto.
```

## Diseño / decisiones

- **Manifiesto cierra arco**: el reel 0023 lanzó el concepto "tu web es un currante más"; este tríptico es la formulación monumental del mismo concepto. La frase del caption del reel se convierte en mural.
- **Panel 2 es el corazón**: "más" en italic verde con underline es la palabra ancla. Visualmente el panel 2 standalone es el más fuerte de los 3 (es el "hero standalone" del mural).
- **Panel 1 y Panel 3 son simétricos**: ambos italic, mismo tamaño, posicionados como apertura y cierre. El cerebro los lee como "abre/cierra" la idea.
- **Sutilezas tonales**: "PIEZA · 03" (panel 1), "· NO UNA VITRINA ·" (panel 2), "NO. 001" (panel 3) — kickers diferentes en cada panel que NO compiten con el hero, pero le dan rytmo editorial diferente.
- **Continuidad**: gradient cream→cream-warm→cream, mismo grano, mismas líneas frame top/bottom, misma horizon line sutil. El bg garantiza unidad visual al juntarse.

## Cooldown post-publicación

| Tema | No repetir antes de | Razón |
|---|---|---|
| Tríptico panorámico / mural feed | 2026-08-28 (3 meses) | Formato fuerte, satura si se repite pronto |
| "Currante / equipo / no vitrina" como ángulo | 2026-08-28 (3 meses) | El concepto necesita reposar |

## Notas técnicas

- Render: 1 HTML 3240×1350 → 4 outputs (panorama + 3 paneles) en una sola corrida de Playwright.
- Slicing: `clip: { x: (n-1) * 1080, y: 0, width: 1080, height: 1350 }` por panel. Pixel-perfect garantizado, no exportar a manopla.
- El `render-statics.mjs` se extendió para soportar `viewport` y `clip` opcionales por job (compatibilidad atrás OK).
- Para regenerar: `cd social-kit/scripts && node render-statics.mjs 0024-triptico-currante`.
