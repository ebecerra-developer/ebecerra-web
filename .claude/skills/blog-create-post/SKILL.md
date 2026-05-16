---
name: blog-create-post
description: Guía operativa para escribir y publicar un post nuevo en el blog de apps/es. Úsalo cuando el usuario pida "redactar un post", "publicar un artículo", "nuevo post del blog", "redacta un artículo sobre X", o cuando vaya a crearse un documento `post` en Sanity desde cero. Cubre tono editorial para PYME/autónomo, estructura mínima, marks especiales (roughCircle, roughUnderline), bilingüe ES+EN obligatorio, generación de cover con Sanity AI y validación visual.
---

# Crear un post nuevo del blog — apps/es

El blog vive en `apps/es`, vendido a **autónomos y dueños de PYMEs en España**. Esta skill orquesta la redacción + publicación. Para arquitectura (queries, layout, schemas) ver skill `/blog-system`.

## 1. Reglas duras de redacción

El público NO es técnico. Aplica todas estas:

### Vocabulario

- **Prohibido sin traducir en línea**: `lock-in`, `Core Web Vitals`, `markup`, `system prompt`, `payback`, `SaaS`, `CRM`, `endpoint`, `framework`, `deploy`, `stack`, `repo`, `commit`, `prompt`, `LLM`, nombres de modelos (`Llama 3.3 70B`, `Groq`, `Gemini`), `cloud provider`, `webhook`, `RSC`, `SSR`.
- **Si tienes que mencionarlo**, traduce en la misma frase: `Core Web Vitals (lo que Google mide para decidir qué webs pone arriba)`.
- **Sustituye marcas técnicas por categoría** cuando puedas: "soluciones tipo plug-and-play que ves anunciadas" en vez de "Tidio, Drift, Intercom".
- **Cero anglicismos cool gratuitos**: `fun project`, `commodity`, `nice to have`. Hay equivalente castellano siempre.

### Tono

- Segunda persona (`tú`), no `el lector` ni `usted`.
- Frases cortas. Punto y aparte generoso.
- Mezcla `Mira,…`, `Lo que pasa es que…`, `Te lo cuento con un caso` con frases declarativas. Acerca.
- Evita "el discurso ha pivotado", "atención experta en sectores regulados", "ventaja competitiva no commodity". Suena a McKinsey.

### Estructura mínima de un post

1. **Hook** (1-2 párrafos): plantea la pregunta o disonancia.
2. **TL;DR en callout** (3 líneas máx): para el lector que hace scan. Usa `style: blockquote` o un `callout` si existe.
3. **3-5 secciones H2** con sub-bullets cortos. NUNCA un bloque H2 con 4 párrafos seguidos — rómpelo.
4. **Al menos 1 caso real anonimizado** con nombre verosímil ("María, dentista en Móstoles", "una asesoría laboral en Sevilla"). Las cifras anclan, las historias retienen.
5. **Pull quote / blockquote** con una frase memorable, sola, hacia el final.
6. **Cierre accionable**: checklist de 2-5 ítems O pregunta-test para auto-clasificarse. NO solo "habla conmigo".
7. **CTA suave** al final, si encaja con el tema.

### Marks especiales (Portable Text)

Disponibles en `post.body[].children[].marks`:

- `strong`, `em`, `code` — estándar.
- `roughCircle` — círculo dibujado a mano alrededor (rough-notation). Para **1 dato impactante** por post: cifras, porcentajes, conclusión clave.
- `roughUnderline` — subrayado a mano. Para frases-bisagra dentro de un párrafo.

**Regla**: un solo `roughCircle` por artículo (más cansa). Máximo 2 `roughUnderline`. Si los pones, póntelos en datos verificables, no en opiniones.

## 2. Bilingüe obligatorio

Cada post tiene `body` (ES) y `bodyEn` (EN). Misma estructura de bloques, mismas keys lógicas (suelo usar `c01..` ES, `m01..` EN o equivalente). El EN no es opcional ni se hace "luego". Mismo commit, mismo publish.

`title` y `excerpt` son `localeString` / `localeText` — completar ambos.

## 3. Schema del post (recordatorio)

Tipo `post` en `packages/sanity-schemas`. Campos clave:

- `title` (localeString), `slug` (slug ES, source: `title.es`).
- `excerpt` (localeText) — 1-2 frases, se ve en listado y meta description.
- `coverImage` con `alt` (string plano, no localeString — está validado).
- `author` (reference → `author`).
- `category` (reference → `blogCategory`, una sola).
- `tags` (array de references → `blogTag`, opcional).
- `publishedAt` (datetime, fecha visible). Sin filtro de futuro — lo que publicas es lo que se ve.
- `body` (PT, ES), `bodyEn` (PT, EN).
- `noindex` (bool, false por defecto).

## 4. Flujo operativo con MCP Sanity

```
project: gdtxcn4l
dataset: production
workspace: ebecerra-web   ← obligatorio en patch/generate
```

1. **Confirma con el usuario** título, ángulo, categoría, longitud aprox.
2. **Redacta el body en ES** siguiendo las reglas de arriba. Trabajo iterativo: outline → borrador → review.
3. **Traduce a EN** manteniendo voz; no es traducción literal de marketing, es paralela.
4. **Genera slug** desde título ES (kebab-case, sin tildes).
5. **`create_documents_from_json`** con `_type: "post"` + body + bodyEn + meta. Slug = source del doc.
6. **`generate_image`** con `imagePath: "coverImage"`. Prompt obligatorio incluye:
   - Estilo: `editorial photograph, warm and inviting`.
   - Paleta: `warm beige, walnut wood, soft forest green accents, cream`.
   - Sin caras, sin texto, sin manos, sin clichés AI/robot.
   - Aspect ratio: pide 16:9 horizontal (las covers se renderizan en `.postCover`).
7. **Espera ~45s** y valida la imagen:
   - Query `*[_id == "drafts.<id>"]{"url": coverImage.asset->url}`.
   - `curl` a la URL → guarda en `C:/temp/<slug>.jpg`.
   - `Read` la imagen local. La revisas visualmente.
   - Si no encaja: refina el prompt y vuelve a `generate_image`. No publiques covers feas.
8. **Patch alt text** con string plano (NO localeString — fallará). Aunque el sitio es bilingüe, `alt` es string plano en el schema actual.
9. **`publish_documents`** con el ID base (sin `drafts.`).
10. **Verifica live**: la home `/blog` se revalida vía webhook Sanity → `apps/es/api/revalidate` → fan-out. Suele estar en <30s.

## 5. Cover image — prompts que funcionan

### Regla nº1: la imagen tiene que contar la tesis del post

Una cover "bonita y de marca" pero abstracta NO sirve, aunque la paleta encaje. El lector tiene que entender de qué va el post mirando la imagen 1 segundo, incluso en tamaño thumbnail dentro del listado.

**Patrón mental**: identifica la tesis en una frase ("el bot atiende cuando tú estás cerrado", "plantilla genérica vs diseño único"), y construye una escena que la represente literalmente. Metáfora artesanal cuando ayuda — pero solo si la metáfora se lee a la primera; si no, mejor literal.

Aprendido en mayo 2026: la primera tanda fue artesanal/abstracta (laptop con burbujas vagas; bloques de madera vs pieza tallada). Bonitas pero el usuario las rechazó por "no tienen que ver con el artículo". La segunda tanda fue literal/temática (móvil con conversación de chat + tienda cerrada con cartel CERRADO; dos portátiles enfrentados mostrando plantilla genérica vs diseño único) y funcionó.

### Estilo base que pega con la marca

> Editorial photograph, warm and inviting. [ESCENA CONCRETA QUE CUENTA LA TESIS]. Color palette: warm beige, walnut wood, soft forest green accents, cream. Soft natural daylight. No people, no faces, no hands, no logos. Shallow depth of field, photorealistic, professional editorial style, 16:9 horizontal composition. Avoid stock-photo AI/robot clichés.

### Reglas operativas del prompt

- **Especifica el sujeto principal en primer plano enfocado** y el contexto (negocio, escena) desenfocado al fondo. Si dejas dos planos al mismo nivel, la IA pierde la jerarquía y se ve genérico.
- **Si necesitas texto en la escena** (carteles, signos), pídelo con palabras CORTAS y mayúsculas — "CERRADO", "ABIERTO". Frases largas salen garabateadas. En pantallas de portátil/móvil, pide explícitamente "no readable text, just abstract layout shapes".
- **Avatares + burbujas de colores distintos** funcionan mejor que "abstract chat bubbles" para representar conversación.
- **Cuando compares dos cosas**, pide split visual claro: dos objetos contrastados lado a lado en la misma toma, con propiedades opuestas explícitas (cold grey vs warm characterful, identical-repeated vs unique-distinctive).
- **Aspect ratio**: 16:9 horizontal. La cover se renderiza en `.postCover` a ese ratio.

### Ejemplos validados (mayo 2026)

- **Chatbot ("cuándo merece la pena")** — tesis: el bot recibe cuando tú no puedes:
  > Close-up of a smartphone propped on a wooden counter, screen in sharp focus showing a chat conversation: grey bubble with small avatar on the left (customer), green bubble with small avatar on the right (business reply), no readable text inside bubbles, just abstract horizontal lines. Behind the phone, softly out of focus: interior of a small Spanish shop at night with a wooden "CERRADO" hanging sign visible in soft bokeh, warm interior light still on. [+ estilo base]

- **Web a medida vs plantilla** — tesis: plantilla genérica vs diseño único:
  > Slightly elevated angle of a wooden desk with two open laptops side by side. LEFT laptop shows a generic template: repetitive grid of identical grey rectangular placeholder blocks, looking cookie-cutter. RIGHT laptop shows a unique editorial magazine-style layout with warm accent colors and asymmetric composition, clearly bespoke. Between them: small terracotta pot with plant, ceramic coffee cup, linen notebook. Left screen reads cold grey, right screen reads warm and characterful. [+ estilo base]

### Validación obligatoria

Nunca publiques una cover sin haberla visto. Workflow:
1. `generate_image` → espera ~45s.
2. Query `coverImage.asset->url` del draft.
3. `curl` a `C:/temp/<slug>.jpg`.
4. `Read` el archivo local (multimodal).
5. ¿Cuenta la tesis del post a la primera mirada? Si NO → refina prompt y regenera. Si SÍ → publica.

## 6. Checklist de publicación (úsalo siempre)

Antes de `publish_documents`:

- [ ] Hook claro en 1-2 párrafos
- [ ] TL;DR / callout al inicio
- [ ] Mínimo 3 H2, ningún H2 con párrafo mayor de ~120 palabras
- [ ] Al menos 1 caso anonimizado con nombre verosímil
- [ ] 1 `roughCircle` en dato impactante (máx)
- [ ] Pull quote (blockquote) hacia el final
- [ ] Checklist accionable o pregunta-test en el cierre
- [ ] CTA suave (no agresivo, no "compra ya")
- [ ] Vocabulario revisado: 0 jerga sin traducir
- [ ] `bodyEn` paralelo a `body`
- [ ] `excerpt.es` y `excerpt.en` rellenos (max ~160 chars cada uno por SEO)
- [ ] `title.es` y `title.en` rellenos
- [ ] `category` referenciada (existe en Sanity)
- [ ] Cover generada y validada visualmente
- [ ] `coverImage.alt` rellenado (string plano)
- [ ] `slug.current` en kebab-case sin tildes
- [ ] `publishedAt` en pasado o presente

## 7. Categorías existentes (consultar antes de crear nueva)

Las categorías son `blogCategory`. Antes de inventar una nueva, query:

```groq
*[_type == "blogCategory"]{_id, "title": title.es}
```

A 2026-05-16 existen al menos: "IA para PYMEs", "Decisiones técnicas". Reutiliza si encaja; crea solo si el ángulo es genuinamente nuevo.

## 8. Anti-patrones (qué NO hacer)

- ❌ Publicar solo en ES "y mañana traduzco". El blog se rompe en /en y queda con fallback feo.
- ❌ Usar la cover fallback (gradiente + monograma). Es para emergencias, no para producción.
- ❌ Listar 5 marcas comerciales seguidas ("Wix, Hostinger, Durable, Squarespace, Framer, Webflow") — el lector PYME desconecta.
- ❌ Cerrar solo con "habla conmigo" sin checklist o pregunta. Pierde valor educativo.
- ❌ Usar nombres de modelos AI específicos (Llama, GPT-4, Claude) en cuerpo de texto visible al cliente.
- ❌ Frases pasivas y largas. Si una frase tiene más de 25 palabras, partela.
- ❌ Olvidar `coverImage.alt` — accesibilidad y SEO.
- ❌ Patch de `alt` como localeString — el campo es string plano, falla con error críptico.
