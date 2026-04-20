# Kit de anotaciones — decisión final

**Fecha cierre:** 2026-04-20.
**Librería:** [`rough-notation`](https://roughnotation.com/) 0.5.1 (instalada en `package.json`).
**Playground:** [`app/playground/annotations/`](../../app/playground/annotations/) — banco de pruebas vivo.

## Resumen rápido

Web va a tener anotaciones hand-drawn como capa expresiva **SIN dibujar nada manualmente**. `rough-notation` (motor Rough.js, 4 KB gzipped) genera los trazos con semilla aleatoria por instancia, animados al entrar en viewport. Lo usan Stripe docs y Linear con buen efecto.

## Tipos disponibles

Los 7 que soporta la librería:

| Tipo | Uso recomendado |
|------|-----------------|
| `underline` | Énfasis en palabras dentro de texto corrido (= negrita con personalidad) |
| `circle` | Rodear palabras/elementos clave — "mira esto" |
| `box` | Enmarcar frases sueltas, stacks, datos tabulares |
| `highlight` | Fluorescente — resaltar nombres propios, claims, citas |
| `strike-through` | Antes/después simple |
| `crossed-off` | Tachado en X — antes/después enfático |
| `bracket` | Corchete lateral agrupando varias líneas |

## Componente

`app/playground/annotations/Annotation.tsx` — wrapper cliente que:

- Espera referencia al DOM con `useRef` + `useEffect`
- Llama a `annotate()` y `.show()` de rough-notation
- Limpia en unmount
- Acepta `type`, `color`, `strokeWidth`, `padding`, `iterations`, `animationDuration`
- Cambia el tag envoltorio con prop `as` (`span` / `div` / `strong` / `em`)

Uso:

```tsx
<Annotation type="underline" color="#047857" strokeWidth={2}>
  convierten
</Annotation>
```

## Reglas de uso (importante)

- **Máximo 2-3 anotaciones por página.** Saturar mata el efecto.
- **Color por defecto: `#047857`** (verde bosque — acento oficial).
- **Color alternativo: `#0C0A09`** (tinta) para anotaciones neutras.
- **Highlight con alpha** (`rgba(4,120,87,.2)`) — no usar el verde sólido para highlight, queda agresivo.
- **No animar cuando la sección no es hero** — `animationDuration={0}` en bloques que se scrollean, sí animar en hero.
- **Nunca** usar anotaciones en CTAs comerciales (botones de "Hablemos"), formularios, o navegación. Su terreno es el contenido narrativo.

## Cuándo se integra

**No ahora.** La home actual es port 1:1 del look oscuro/hacker legacy — las anotaciones verdes desentonan ahí.

**Sí en Fase 5+** cuando rediseñemos las secciones con los tokens pro (stone warm neutrals + verde bosque). El entorno natural para este kit.

El componente `<Annotation>` y el playground quedan listos y probados esperando.

## Exploraciones descartadas

En `_scrapped/`:
- `demo.html` (v1) — SVG hechos a mano con linecap round. "Sharpie infantil". Descartado.
- `demo-v2.html` — filled paths calligráficos. Quedó como clip-art. Descartado.
- `demo-v3.html` — linecap square/butt. "V1 con esquinas en pico". Mejoraba poco.
- `demo-v4.html` — doble trazo para simular grosor variable. Complejidad alta, resultado forzado. Descartado.

Todos los intentos manuales quedaron lejos del resultado que da `rough-notation` de serie. Lección para sesiones futuras: **antes de implementar algo artesanal, buscar la librería existente**.
