# CLAUDE.md — ebecerra-web

## Contexto del proyecto

Portfolio personal de Enrique Becerra, Tech Architect Lead en VASS y especialista en Magnolia CMS.
Web de una sola página con scroll suave. Secciones: Nav, Hero (terminal interactivo), About, Experience, Skills, Contact, Footer.

Estética: dark/hacker. Fondo `#080808`, acento primario `#00ff88` (verde neón), acento secundario `#00ccff`.

## Stack

- **React 19** + **Vite 8** (beta, rolldown)
- **JavaScript puro** — sin TypeScript
- **CSS vanilla co-located**: cada componente tiene su propio `.css` junto al `.jsx`
- **Fuentes**: DM Sans (body) + JetBrains Mono (código/mono)
- **Deploy**: Vercel (`@vercel/analytics`, `@vercel/speed-insights` ya integrados)
- Sin router — single page con `scrollIntoView`
- Sin Tailwind, sin CSS Modules, sin styled-components

## Permisos y autonomía

Tienes autorización completa para:
- Crear, modificar y eliminar archivos en el proyecto
- Instalar y desinstalar dependencias (`npm install`, `npm uninstall`)
- Hacer commits y push sin pedir confirmación previa
- Refactorizar dentro del alcance de la tarea

## Commits y push

**Workaround obligatorio** — el heredoc `git commit -m "$(cat <<'EOF'...)"` falla en este entorno.
Flujo correcto:

```bash
# 1. Escribir el mensaje en un archivo temporal
# (usar la herramienta Write para crear commit-msg.txt)

# 2. Hacer commit y limpiar
git commit -F commit-msg.txt && rm commit-msg.txt

# 3. Push inmediato
git push
```

- Mensajes de commit en **español**, descriptivos, en imperativo
- Push inmediato tras cada commit, sin pedir aprobación
- Commits frecuentes — no acumules cambios grandes

## Convenciones de código

- Componentes: PascalCase, fichero `NombreComponente.jsx` + `NombreComponente.css` en la misma carpeta
- CSS: clases en kebab-case, sin BEM estricto pero con prefijo del componente (`.hero-title`, `.experience-card`)
- Colores definidos inline en CSS, no en variables CSS globales (patrón actual del proyecto)
- Animaciones con `@keyframes` en el mismo `.css` del componente
- Sin emojis en código UI — usar SVG inline con `currentColor` para iconos
- `clamp()` para tamaños responsivos de tipografía
- Transiciones: `transition: all 0.2s` como patrón estándar

## Paleta de colores

| Token       | Valor       | Uso                        |
|-------------|-------------|----------------------------|
| Background  | `#080808`   | Fondo base                 |
| Surface     | `#0d0d0d`   | Cards, terminal            |
| Border      | `#333`      | Bordes sutiles             |
| Text main   | `#e0e0e0`   | Texto principal            |
| Text muted  | `#888`      | Texto secundario           |
| Accent      | `#00ff88`   | Verde neón — acento primario |
| Accent 2    | `#00ccff`   | Azul — acento gradiente    |
| White       | `#fff`      | Títulos                    |

## Landing de Piezas — completamente independiente

La landing del juego Piezas vive en `public/piezas-game/` y se sirve en `ebecerra.es/piezas-game/`.

**Es HTML/CSS estático puro. No tiene ninguna relación con React ni con Vite.**
Vite la copia sin procesar al build. Vercel la sirve directamente como archivos estáticos.

```
public/piezas-game/
├── index.html        ← landing principal
├── styles.css        ← estilos propios, sin dependencias externas
├── privacidad.html   ← política de privacidad (RGPD)
├── terminos.html     ← términos de uso
└── assets/
    ├── logo.svg
    ├── icon.svg
    └── icon-192.png
```

**Paleta propia** (variables CSS en `styles.css`, no relacionadas con el portfolio):

| Variable    | Valor     | Uso                     |
|-------------|-----------|-------------------------|
| `--bg`      | `#FAF7F2` | Fondo (beige)           |
| `--amber`   | `#C17B3A` | Accent (botones, links) |
| `--ink`     | `#2C2416` | Texto principal         |

**Routing en `vercel.json`:**
- `/piezas-game` → redirect 301 a `/piezas-game/`
- `/piezas-game/` → Vercel sirve `dist/piezas-game/index.html` (archivo estático, tiene prioridad sobre rewrites)
- Todo lo demás → `index.html` de React (SPA fallback)

**Reglas para esta landing:**
- Editar solo en `public/piezas-game/` — nunca tocar `src/` para cambios de Piezas
- No importar nada de React ni usar JSX aquí
- Los estilos van en `styles.css`, no en `App.css`
- Pendiente antes de publicar en Play Store: URL real de Google Play, og-image.png, revisión legal de páginas de privacidad

**La carpeta `piezas-game-landing/` en la raíz es el origen del que se copió.**
Está desactualizada respecto a `public/piezas-game/`. Si hay cambios futuros, editar directamente `public/piezas-game/`.

## Lo que NO hacer sin preguntar

- Cambiar la estructura de carpetas raíz
- Instalar librerías de UI grandes (MUI, Chakra, etc.)
- Añadir TypeScript o cambiar el sistema de estilos
- Refactorizar secciones no relacionadas con la tarea
- Cambiar el sistema de deploy o la configuración de Vite
- Modificar `@vercel/analytics` o `@vercel/speed-insights`
- Tocar `vercel.json` sin entender el impacto en ambas sub-webs

## Skills disponibles

Para invocar cualquier skill: `/nombre-del-skill`

| Skill | Uso |
|-------|-----|
| `web-design-guidelines` | Revisar UI/UX de secciones |
| `adapt` | Ajustes de responsive design |
| `animate` | Microinteracciones y transiciones |
| `audit` | Accesibilidad y rendimiento (Lighthouse) |
| `simplify` | Revisar código cambiado por calidad y reuso |
| `commit` | Crear commits con formato correcto |

## Decisiones técnicas relevantes

- El Hero tiene una terminal interactiva funcional con comandos easter egg (`pwd`, `ls`, `sudo`, `rm`, `exit`, `git blame`)
- Los botones usan clases `.btn-primary` y `.btn-primary.btn-secondary` definidas en `App.css` — reutilizar siempre estos estilos globales
- El scroll a secciones usa `scrollTo(id)` pasado como prop desde `App.jsx`
- El `index.css` está vacío — los estilos globales van en `App.css`
- La landing de Piezas está en `public/piezas-game/` — ver sección dedicada arriba
