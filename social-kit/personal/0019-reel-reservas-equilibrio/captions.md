# 0019 · REEL · Coger citas mientras duermes (reservas online)

- **Tipo**: reel animado 1080×1920, 20s (17s anim + 3s hold), 30fps, sin audio
- **Estado**: en producción, subir 2026-05-23 cuando el sistema esté desplegado en `demos.ebecerra.es/equilibrio`
- **Categoría**: producto / capacidades
- **Outputs**: `final.mp4` + `poster.png`
- **Pieza complementaria**: [`0020-story-reservas-real`](../0020-story-reservas-real/) — story estática con screenshot REAL del modal + link sticker, subir unas horas después

## Caption

```
Son las 23:14 de un martes. Tu cliente quiere pedir cita.

¿Va a esperar a mañana para llamarte? Igual sí.
O igual le pasa el dolor, abre Google y reserva con el siguiente.

Una web que sabe coger citas es una web que cubre las horas que tú no.

→ Sin llamadas que se te cuelan.
→ Sin WhatsApp a las tantas que luego se te olvida contestar.
→ Sin agenda perdida en un cuaderno.

El cliente ve hueco, lo escoge, le llega un email con su cita.
Tú abres el panel por la mañana y la semana está montada.

Lo tienes vivo en demos.ebecerra.es/equilibrio · pide una cita falsa y mira cómo va.

DM si te encaja para tu negocio.

#reservasonline #autonomosespana #pymeespaña #webparafisios #webparaempresas #fisioterapia #agendaonline #marketingdigital
```

## Alt text

```
Reel vertical en 5 escenas con paleta cálida color crema y teal. Empieza con texto sobre fondo crema: "Tu cliente quiere cita. Y son las 23:14 de un martes. ¿Va a esperar a mañana para llamarte?". Sigue con un móvil mostrando la demo Equilibrio Fisioterapia y un clic animado sobre el botón "Pide tu primera sesión". Aparece un modal con calendario donde se selecciona el día 21 y la hora 17:00, y el botón "Confirmar cita" se ilumina. Salta a una pantalla con un check verde grande y el texto "Cita confirmada. Miércoles 21 · 17:00". Cierra con frame verde de marca eB: "tu web puede · Coger citas mientras duermes" + @ebecerra.es + demos.ebecerra.es/equilibrio.
```

## Música sugerida

- **Estilo**: minimal tech / lo-fi productivo. Beat suave que sube ligeramente en la confirmación. Energía 2/5.
- **Búsqueda en IG audio**: `minimal lo-fi`, `productive beat`, `satisfying tech`, `chill electronic`.
- Volumen 60-70%. No vocales (el reel se lee).

## Comentario fijado

```
🗓️ Pruébala tú: demos.ebecerra.es/equilibrio · pide una cita falsa con el sistema real. Si lo quieres para tu negocio (cualquier sector con agenda — fisio, peluquería, estética, coaching, consultorio), DM y lo montamos.
```

## Cooldown

Reservas online / "coger cita mientras duermes" / scheduling: no antes de **2026-06-23** (1 mes). Después se puede volver con variante (otro sector, otro ángulo: ahorra-tiempo, no-más-llamadas, etc.).

## Notas de producción

- Mockup del modal en el Reel (escena 3) está hecho en HTML/CSS dentro de [`index.html`](index.html) con la paleta Equilibrio. Es **un mockup estilizado**, no un screenshot real (cumple su función: ilustrar el concepto en formato Reel).
- La story complementaria [`0020-story-reservas-real`](../0020-story-reservas-real/) es la que enseña el sistema REAL — captura Playwright + link sticker manual a `demos.ebecerra.es/equilibrio`. Esa es la que respeta literalmente la regla de veracidad.
- Si en algún momento el modal real cambia de aspecto y se quiere actualizar el mockup del Reel para alinearse: editar las clases `.cal`, `.hours`, `.modal__cta` en [`index.html`](index.html).
