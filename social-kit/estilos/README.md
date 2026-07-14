# Estilos reutilizables · social-kit

Biblioteca de componentes visuales para publicaciones (IG/FB). Piezas de estilo
que ya hemos trabajado y queremos poder **reutilizar** en futuras publicaciones
sin volver a diseñarlas desde cero.

Regla de marca (siempre): fuente **Inter**, acento por **color** (nunca cursiva),
paleta verde `#047857` / verde-claro `#6EE7B7` / crema `#FAF6EE`.

---

## Kickers — `kickers.html`

El **kicker** es la etiqueta que corona una publicación: `NOVEDAD`, `¿SABÍAS QUE…?`,
`PROCESO`, `DETRÁS DE CÁMARAS`… Abre `kickers.html` en el navegador (o mira
`kickers.png`) para verlos todos con su CSS al lado, listo para copiar.

| Clase | Estilo | Cuándo |
|---|---|---|
| `.kick-std` | Estándar (texto verde-claro, sin caja) | Por defecto. Neutro y siempre correcto. |
| `.kick-a` | Pill translúcida + glow | Destacar con sutileza, aire premium. |
| `.kick-b` | Pill sólida verde (badge "NUEVO") | Máximo protagonismo. Con moderación. |
| `.kick-c` | Texto shine (degradado de brillo) | Ligero y luminoso, sin caja. |
| `.kick-d` | "En vivo" — la estrella ✦ brilla | Aire de recién lanzado. **En uso: post tiendas online (15 jul).** |

Para usar uno: copia su bloque `.kick-XXX` del `<style>` de `kickers.html` a tu
pieza y ajusta `margin` según el layout.

### Regenerar el preview

```bash
cd social-kit/scripts
# (script puntual con playwright: cargar kickers.html y screenshot fullPage → estilos/kickers.png)
```

> Solo se versionan `.html`, `.css` y `.md`. El `kickers.png` es regenerable y va gitignored.
