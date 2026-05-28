# 0024 · TRÍPTICO · "Hago webs que dan resultados"

- **Tipo**: 3 posts feed 1080×1350, cortados pixel-perfect de un panorama 3240×1350
- **Estado**: para publicar (mural de perfil)
- **Categoría**: diferenciación / marca
- **Outputs**: `panorama-full.png` (referencia) + `panel-1.png`, `panel-2.png`, `panel-3.png`

## Orden de subida (IMPORTANTE)

IG coloca el post más nuevo arriba-izquierda del grid. Para que el mural quede izquierda→derecha:

| Orden | Archivo | Queda en |
|---|---|---|
| 1º | `panel-3.png` | columna derecha |
| 2º | `panel-2.png` | columna centro |
| 3º | `panel-1.png` | columna izquierda |

Espaciar ~30-60 min entre cada uno. Cada post con su caption (abajo). Cross-post a FB automático.

## Captions (uno por post, cortos y distintos)

### panel-3 (sube 1º)

```
¿Le damos una vuelta a tu web?
Escríbeme y lo hablamos, sin compromiso.

#webparaempresas #autonomosespana #diseñoweb
```

### panel-2 (sube 2º)

```
Una web bonita está bien. Una que trabaje, mejor.
Rápida, clara y pensada para que te lleguen clientes.

#pymeespaña #paginasweb #marketingdigital
```

### panel-1 (sube 3º)

```
Hola, soy Enrique 👋
Hago webs para autónomos y pequeños negocios. Una persona, de principio a fin.

#freelancespain #webparapymes #emprendedores
```

## Alt text (uno por panel — NO repetir el mismo en los 3)

**panel-3:**
```
Sobre fondo verde, el texto "¿lo vemos juntos?" en letras con borde claro y destellos alrededor, junto al borde de un marco blanco.
```

**panel-2:**
```
Marco blanco sobre fondo verde con la frase "Hago webs que dan resultados" en tipografía serif, "resultados" en verde.
```

**panel-1:**
```
Enrique Becerra de pie con camisa azul marino sobre fondo verde. Arriba a la izquierda, el logo eB · ebecerra.es.
```

## Música (opcional)

En posts de foto IG permite añadir audio, pero pesa poco (no es Reel/Story). Para un mural de marca **no es necesaria**. Si quieres ponerla: instrumental suave/corporativo, sin voz, y el mismo en los 3 o ninguno. No condiciona la pieza.

## Notas

- Mural de perfil: el valor está en el conjunto visto en el grid; cada post aislado funciona como fragmento.
- Render: `cd social-kit/scripts && node render-statics.mjs 0024-triptico-currante` (genera panorama + 3 paneles con clip).
- Foto recortada del propio Enrique sobre fondo blanco de estudio (`Quique-corporativo-sin-fondo.png`).
