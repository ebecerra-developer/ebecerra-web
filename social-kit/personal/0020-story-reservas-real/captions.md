# 0020 · Story · Reservas online — está vivo

**Tipo:** Story 1080×1920 estática (PNG)
**Cuándo:** mismo día que el Reel 0019, unas horas después
**Por qué dos piezas el mismo día:** la story es **contenido independiente** (screenshot real + link sticker), no un "compartir Reel". No canibaliza el alcance del 0019.
**Pieza relacionada:** [`0019-reel-reservas-equilibrio`](../0019-reel-reservas-equilibrio/) (el reel mockup; esta story enseña que existe de verdad)

---

## Link sticker

Manual en IG al subir la story:
- **URL:** `https://demos.ebecerra.es/equilibrio`
- **Texto sticker:** "Pide cita" (o el default IG)
- **Posición:** arrastrar sobre la flecha "↑ aquí va el sticker ↑" (top centro, ~y=240px en preview IG)
- **Estilo:** el verde claro de IG queda bien sobre el cream; si IG ofrece "Black & white", también

---

## Alt text (accesibilidad)

```
Captura de móvil de la demo Equilibrio Fisio con el sistema de reservas online abierto. Encima, en serif sobre fondo crema: "Pide cita online". Una flecha indica dónde colocar el link sticker para probarlo.
```

---

## Caption (opcional — las stories suelen ir sin texto adicional, pero por si lo quieres como reply automático o post-it interno)

```
Está vivo.
Demo equilibrio + reservas online en demos.ebecerra.es/equilibrio.
Pide una cita falsa, mira cómo va.
```

---

## Workflow para subir

1. Esperar a que el sistema de reservas esté desplegado en `demos.ebecerra.es/equilibrio` (chequear que el botón "Pide tu primera sesión" abre el modal real).
2. Correr `node scripts/capture-booking-modal.mjs` desde `social-kit/scripts/` → genera `assets/captures/demo-equilibrio-booking-modal.png`.
3. Editar [`index.html`](index.html) y cambiar el `src` del `<img>` placeholder por `../assets/captures/demo-equilibrio-booking-modal.png`.
4. Correr `node scripts/render-statics.mjs 0020-story-reservas-real` → genera `final.png`.
5. Subir `final.png` a IG como story. Añadir link sticker manual sobre la zona indicada con URL `https://demos.ebecerra.es/equilibrio`.
6. Tras publicar: añadir a **highlight "servicios"** (regla [[feedback-stories-highlights]]).

---

## Notas de diseño

- Paleta equilibrio (no eB verde) para que el frame "respire la marca del cliente que demuestras"
- Phone mockup con tilt -1.5° (más vivo que recto, sin marearse)
- Brand corner `[eB] reservas` arriba a la izquierda — establece autoría sin protagonismo
- Sin animaciones; story estática (no necesita GSAP)
- Zona top reservada para el link sticker manual — la flecha es una "instrucción visual" que también funciona si el sticker no se coloca exactamente ahí

---

## Música sugerida (si decides poner audio)

Las stories estáticas suelen ir sin música, pero si quieres añadir IG-native audio:
- Algo low-fi tranquilo (matching cream/petrol palette)
- Ambient/lo-fi <30s; volumen al 30%
- IG mostrará un sticker de audio que podemos esconder detrás del phone si no lo quieres visible
