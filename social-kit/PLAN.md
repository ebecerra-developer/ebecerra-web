# Plan social — ebecerra.es

Fuente única de verdad para producción de contenido IG/FB. Se edita a mano según va saliendo material.

**Convención:** este archivo guía qué se produce y qué no se repite. Las plantillas reutilizables viven en [`_templates/`](_templates/). Los outputs finales del día van a [`personal/YYYY-MM-DD/`](personal/).

Acompañar siempre con [CATEGORIES.md](CATEGORIES.md) (5 categorías, no publicar dos seguidas de la misma).

---

## 📥 Backlog (ideas brutas, sin pulir)

Ordenadas por intuición de impacto, no por prioridad inmediata. Mover a "En producción" cuando se concrete una pieza.

### Tipo · Producto / capacidades
- [x] Story animada — **velocidad de carga** *(producida 2026-05-14, planificada 2026-05-15)*
- [ ] Story animada — **formulario que sí llega** (mock form → email entrando en bandeja)
- [ ] Post single — **tu web en ChatGPT** (mockup respuesta IA + CTA "¿la miramos?")
- [ ] Story serie animada — **glosario** (dominio, hosting, SSL) con metáforas físicas animadas

### Tipo · Portfolio / demos
- [ ] Story individual de cada demo (eco, equilibrio, marta, claudia) — una al mes para no quemar
- [x] Reel animado "rescate visual" — antes/después *(producido 2026-05-14, planificado 2026-05-15)*

### Tipo · Educativo / mitos / proceso
- [x] Reel "3 puertas: Google + ChatGPT + Maps" *(producido 2026-05-14, planificado 2026-05-19)*
- [x] Story "qué es AEO" glosario *(producida 2026-05-14, planificada 2026-05-19)*
- [ ] Carrusel — **proceso paso a paso** (briefing → propuesta → trabajo → lanzamiento → soporte)
- [ ] Carrusel — **mitos sobre tener una web** (5 mitos → 5 verdades)
- [ ] Carrusel — **4 cosas que tu cliente nota en tu web sin que tú lo sepas** (velocidad, móvil, formulario, diseño)
- [ ] Carrusel — **N señales de que tu web necesita un rescate** (formato probado, dispara DMs)
- [ ] Post single — **cuánto tarda una web (de verdad)** sin precios, con tiempos

### Tipo · Diferenciación / valores
- [x] Post single — "Lo que NO hago" *(publicado 2026-05-13)*
- [ ] Post single — "Lo que SÍ hago de serie" (versión positiva, esperar ≥6 semanas)
- [ ] Carrusel — "Sin agencia. Sin equipo. Sin packs." (3 cards)

### Tipo · Personal / behind the scenes
- [ ] Foto escritorio + caption sobre cómo es un sábado montando web (sin mentir sobre ser independiente)
- [ ] Reel/foto — "Esto es lo que tengo abierto a las 11 de la noche cuando salgo a montar web" (transparente sobre side-gig si llega el momento)

---

## 🛠️ En producción

| Fecha publicación | Pieza | Estado |
|---|---|---|
| 2026-05-19 (lunes) | **Story "53% se va · velocidad" (10s)** — pendiente resolver cifras 7,4/1,2 (mediación: web típica 38% suspende CWV vs mis demos en verde) | MP4 listo, copy por decidir |
| 2026-05-22 (jueves) | **Story "¿qué es AEO?" (10s)** — separada del Reel 3 puertas para no saturar el ángulo el mismo día | MP4 listo · captions en [`personal/2026-05-19/captions.md`](personal/2026-05-19/captions.md) |
| 2026-05-16 (sábado) | **Story-pregunta nativa IG** (sin assets) — slot opcional engagement | Por crear |

---

## ✅ Publicado (log para no repetirse)

### 2026-05-13 · miércoles · día 1 fuerte
- **Carrusel** — "4 demos, 4 tipos de cliente" (7 slides) · cat: **portfolio**
- **Story animada** — chatbot demo (12s, captura lead) · cat: **producto**
- **Story estática** — demo eco. · cat: **portfolio**
- **Story estática** — "5 webs, 5 chatbots" pruébalos · cat: **portfolio**
- **Post single** — "Lo que NO hago" (1080×1350) · cat: **diferenciación**
- Carpeta: [`personal/2026-05-14/`](personal/2026-05-14/) (captions, archivos)
- Highlights asignados: chatbot animado → **servicios** · 4 demos + eco + pruébalos → **imagina**

### 2026-05-15 · jueves · día 2
- **Reel "Rescate visual"** (18s) — antes feo → demo eco real · cat: **producto / diferenciación**
- **Reel "3 puertas · Google + ChatGPT + Maps"** (18s, adelantado del 19 may) — mockups SERP + chat + maps con Equilibrio Fisio · cat: **educativo / diferenciación / AEO**
- Stories velocidad y AEO **NO subidas** — decisión consciente: con 2 reels el mismo día, añadir 2 stories de los mismos temas habría saturado y sonaba a contradicción de mensaje. Se redistribuyen a la semana siguiente.
- Carpeta: [`personal/2026-05-15/`](personal/2026-05-15/) (captions, archivos)
- Hito técnico paralelo: añadidos `llms.txt` + `.well-known/ai.txt` + robots con AI agents explícitos (commit `8cf94b2`) para que el reel 3 puertas tenga AEO real detrás cuando los crawlers IA lleguen.

---

## 🚫 Cooldown (no repetir antes de)

Reglas para no quemar temas. Si choca, pivotar a otra cosa del backlog.

| Tema | No repetir antes de | Razón |
|---|---|---|
| "Lo que NO hago" (mismo formato) | 2026-08-13 (3 meses) | Acabamos de publicar |
| "4 demos / portfolio completo" | 2026-07-13 (2 meses) | Carrusel reciente cubre todo |
| Chatbot como protagonista | 2026-06-13 (1 mes) | Tres piezas en un día sobre eso |
| Demo individual (eco/equilibrio/marta/claudia) | Cada una 1 mes | Rotar |
| "Sin plantillas / sin agencias" como ángulo central | 2026-07-13 (2 meses) | Ya en "Lo que NO hago" |
| AEO / "3 puertas" / "te citan en ChatGPT" | 2026-06-15 (1 mes tras Reel 3 puertas) | El concepto necesita reposar antes de variar |
| Rescate visual antes/después con demo eco | 2026-07-15 (2 meses) | El Reel cubre la idea; siguiente variante con otra demo |
| Velocidad/Core Web Vitals | sin cooldown todavía (Story no subida 2026-05-15) | Cifras pendientes de resolver antes de publicar |

---

## 🎯 Cadencia objetivo

**3 piezas/semana de techo. Realista para side-gig.**

| Día | Slot | Tipo |
|---|---|---|
| Lunes | 10:00 | Post fuerte (carrusel o single image) |
| Jueves | 13:00 | Story animada o carrusel ligero |
| Sábado | (opcional) | Story-pregunta para engagement, sin curro |

Si una semana no apetece, salta. No forzar.

---

## ✅ Checklist 30 segundos antes de producir

- [ ] ¿Cooldown OK? (revisa la tabla arriba)
- [ ] ¿Categoría distinta a la última publicación?
- [ ] ¿Es honesto? (no inventar situaciones laborales, clientes, números, casos de éxito)
- [ ] ¿Producible en <90 min?

Los 4 sí → produce. Si no → al backlog.

---

## 📱 Operativa de publicación

- **Posts e imágenes** → cross-post a Facebook automático (ya configurado).
- **Stories** → marcar manualmente "Compartir también en Facebook" antes de publicar.
- **Highlights** → solo IG. Facebook tiene su propia cover 1640×624 (carpeta [`personal/covers/`](personal/covers/)).
- **Reordenar Highlights** → IG ordena por última Story añadida (más reciente = posición 1). Para reordenar, sube las Stories en orden **inverso** al deseado y luego añádelas al highlight.

---

## 🔗 Recursos clave

- **Skill** completa: `~/.claude/skills/social-media-kit/SKILL.md` (paleta, anti-patrones, workflow Playwright, captions, alt text, comentarios fijados)
- **Categorías** (5, alternar): [CATEGORIES.md](CATEGORIES.md)
- **README** del kit: [README.md](README.md)
- **Templates HTML**: [_templates/](_templates/)
- **Scripts Node** (capturas / vídeo): [_templates/scripts/](_templates/scripts/)
