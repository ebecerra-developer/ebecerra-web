# 0020 · Story · Reservas online — está vivo (animada)

**Tipo:** Story animada 1080×1920 (MP4), 15s (12s anim + 3s hold), 30fps, sin audio
**Cuándo:** mismo día que el Reel 0019, unas horas después
**Por qué animada y no estática:** el flow de reservas se entiende mucho mejor viendo los pasos en secuencia que en un solo frame. 6 capturas reales del widget desplegado (no mockup) animadas con cross-fade.
**Pieza relacionada:** [`0019-reel-reservas-equilibrio`](../0019-reel-reservas-equilibrio/) (el reel con mockup del concepto; esta story enseña los pasos reales)

---

## Secuencia de frames (en el phone mockup)

| # | t (s) | Contenido | Caption sincronizada |
|---|---|---|---|
| 1 | 1.0–2.8 | Portada equilibrio (hero `Cuida tu cuerpo. Sin parches.`) | `Demo · Equilibrio Fisioterapia` |
| 2 | 2.8–4.8 | Sección "Reserva tu sesión" + step 1 visible | `Sección Reserva online` |
| 3 | 4.8–6.8 | Step 1 zoomed: 4 servicios (Primera valoración / Sesión / Punción / Pilates) | `1. Elige un servicio` |
| 4 | 6.8–8.8 | Step 2: calendario Mayo 2026 (días 25-29 disponibles) | `2. Elige el día` |
| 5 | 8.8–10.8 | Step 3: hora — Martes 26 con slots Mañana/Tarde/Noche | `3. Elige la hora` |
| 6 | 10.8–12.0 → hold 12.0–15.0 | Step success: "Cita solicitada · Te hemos enviado un email…" | `✓ Cita solicitada` |

Capturas en [`personal/assets/captures/`](../assets/captures/):
- `demo-equilibrio-mobile.png` (portada)
- `demo-equilibrio-booking-step1-servicios.png`
- `demo-equilibrio-booking-step2-dia.png`
- `demo-equilibrio-booking-widget.png` (paso hora)
- `demo-equilibrio-booking-step6-solicitada.png`

(El frame 6 se generó inyectando el success view en DOM via Playwright para evitar crear una reserva real en el sistema solo para la foto.)

---

## Link sticker

Manual en IG al subir la story:
- **URL:** `https://demos.ebecerra.es/equilibrio`
- **Posición:** arrastrar sobre la flecha "↑ aquí va el sticker ↑" (top centro)

---

## Alt text

```
Vídeo vertical en story IG. Sobre fondo crema con título "Pide cita online", se ven dentro de un mockup de móvil seis capturas reales del sistema de reservas de la demo Equilibrio Fisioterapia: la portada, la sección de reserva, la pantalla de elegir servicio, el calendario de mayo 2026, la lista de horas del martes 26, y la pantalla final "Cita solicitada". Un caption pequeño debajo del título va anunciando cada paso (1. Elige un servicio · 2. Elige el día · 3. Elige la hora · ✓ Cita solicitada).
```

---

## Caption sugerida (opcional, IG)

```
Es la 1 de la madrugada.
Tu cliente quiere cita.

Estos son los pasos REALES en demos.ebecerra.es/equilibrio
(no son maquetas — pruébalo y deja la reserva colgada, si quieres).

Para tu negocio: DM.
```

---

## Música sugerida

- **Estilo**: lo-fi / minimal tech, beat suave que NO pisa la lectura.
- Volumen 40-50% (la story es de "lectura", no de baile).
- Búsqueda en IG audio: `chill demo`, `minimal product`, `lo-fi tech`.

---

## Workflow de actualización (si cambia el widget)

1. Re-capturar pasos con MCP Playwright o con el script `capture-booking-modal.mjs` (ajustar nombres de archivo si renombras pasos)
2. Las nuevas capturas reemplazan las antiguas en `personal/assets/captures/`
3. Re-grabar: `cd social-kit/scripts && node record-animated.mjs 0020-story-reservas-real`
4. El `final.mp4` se regenera con las capturas actualizadas

---

## Notas de diseño / GSAP

- Cross-fade de 0.5s entre frames, captions sincronizadas con offset +0.1s
- Frame 3 (servicios) tiene ken-burns continuo (scale 1.15 → 1.28) sobre el mismo asset que frame 2, para diferenciar "ver sección" vs "enfocar servicios"
- Frame 6 entra con `back.out(1.4)` + check pop, y mantiene micro-zoom durante el hold final
- Timeline `paused: true` + seek deterministico por frame (gotcha #8 del SKILL: real-time perdería frames a 80ms screenshot/1080×1920)
