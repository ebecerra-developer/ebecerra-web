---
name: chatbot-system
description: Arquitectura y flujo operativo del chatbot embebido en apps/es, apps/tech y apps/demos. Úsalo al editar greetings/system prompts, cambiar la cadena de modelos Groq, añadir contexto a un nuevo dominio o demo, o diagnosticar por qué el bot no responde.
---

# Chatbot system — ebecerra-web

Recepción conversacional con IA. Llama 3.3 70B (Groq) como primario + cadena de fallback de 5 modelos cuando se agota la cuota. Streaming SSE end-to-end. Configuración editorial (greeting, system prompt, disclaimers) viene de Sanity y se edita sin redeploy.

## Arquitectura

```
Usuario → Widget (cliente) → /api/chat (edge) → Sanity (system prompt) + Groq (LLM)
                                                                   ↓
                                                          SSE stream → Widget
```

- **Paquete `@ebecerra/chatbot`** ([`packages/chatbot/`](../../../packages/chatbot/))
  - `/server` — cliente Groq con fallback inline (`streamGroqChat`), parser SSE (`toClientSSE`), builder de system prompt (`buildSystemPrompt`).
  - `/client` — `ChatbotWidget.tsx` (botón flotante + drawer mobile-first), `sse.ts` (parser async iterator).
- **Schema** [`packages/sanity-schemas/schemas/chatbot.ts`](../../../packages/sanity-schemas/schemas/chatbot.ts) — objeto reutilizable embebido en `profile` (campos `chatbot` para .es y `chatbotTech` para .tech) y en `demoSite`.
- **API routes** una por app: [`apps/es/app/api/chat/route.ts`](../../../apps/es/app/api/chat/route.ts), [`apps/tech/app/api/chat/route.ts`](../../../apps/tech/app/api/chat/route.ts), [`apps/demos/app/api/chat/route.ts`](../../../apps/demos/app/api/chat/route.ts). Edge runtime.

## Cadena de modelos (Groq free tier)

En orden de preferencia, definida en [`packages/chatbot/src/server/models.ts`](../../../packages/chatbot/src/server/models.ts):

1. `llama-3.3-70b-versatile` — mejor calidad. 12K TPM · 100K TPD.
2. `meta-llama/llama-4-scout-17b-16e-instruct` — 30K TPM · 500K TPD (absorbe picos).
3. `openai/gpt-oss-120b` — otro vendor.
4. `qwen/qwen3-32b` — único con 60 RPM.
5. `openai/gpt-oss-20b` — backup.
6. `llama-3.1-8b-instant` — último recurso, 14.4K RPD.

Si el primario devuelve 429/5xx → salta al siguiente automáticamente (mismo request). Si todos fallan → `GroqExhaustedError` → 503 al cliente.

**Cambiar la cadena:** edita `MODEL_CHAIN` en el archivo, commit + push. No es contenido editorial.

## Configuración editorial (Sanity)

Cada chatbot tiene 5 campos editables vía Studio o MCP:

- `enabled` (bool) — render condicional.
- `label` (localeString) — texto del botón flotante.
- `title` (localeString) — cabecera del drawer.
- `greeting` (localeText) — primer mensaje del bot.
- `placeholder` (localeString) — input.
- `systemPrompt` (localeText) — **contenido principal**: tono, sobre el negocio, servicios, precios, qué hacer, qué NO hacer, redirecciones.
- `disclaimers` (array localeString, máx 3).

**Localización:** todos los campos son `localeString`/`localeText` con `es` y `en`. La API selecciona el idioma según el `locale` que envía el cliente.

### Dónde vive cada uno

| Contexto | Doc Sanity | Campo |
|---|---|---|
| apps/es (comercial) | `profile` singleton | `chatbot` |
| apps/tech (técnico) | `profile` singleton | `chatbotTech` |
| Demo (cada uno) | `demoSite` doc del slug | `chatbot` |

## Editar contenido vía MCP

**Workspace:** `ebecerra-web` (NO `default`). Project `gdtxcn4l`, dataset `production`.

Patrón para editar el system prompt de apps/es:

```
mcp__sanity__patch_document_from_json {
  resource: { projectId: "gdtxcn4l", dataset: "production" },
  workspaceName: "ebecerra-web",
  documentId: "136f3077-4754-470c-9f79-663097a57568",  // profile singleton
  set: [{
    path: "chatbot.systemPrompt",
    value: { _type: "localeText", es: "...", en: "..." }
  }]
}
```

Tras el patch, llamar a `publish_documents` con el mismo ID para hacerlo público.

**IDs útiles:**

- profile: `136f3077-4754-470c-9f79-663097a57568`
- equilibrio (fisio): `cbd1babf-304c-45c5-b1af-07559a93ce05`
- marta-solana (coach-editorial): `169134cb-cedc-4eaa-919f-18192e596590`
- claudia-entrena (coach-vibrant): `b1fa9a66-caeb-4f52-afc4-5f25b8e25963`
- eco (tandem): `eccf8360-42be-4128-b939-29fa726145df`

## Estructura del system prompt (patrón validado)

Los 6 system prompts siguen esta estructura. Replicar al crear uno nuevo:

1. **# QUIÉN ERES** — rol del bot.
2. **# CONTEXTO IMPORTANTE: ERES UNA DEMO** (solo demos) — recordatorio de que es una demo de ebecerra.es.
3. **# TONO** — registro, persona gramatical, idioma.
4. **# SOBRE [NEGOCIO/PERSONA]** — bio y posicionamiento.
5. **# SERVICIOS Y PRECIOS** — catálogo con cifras del doc Sanity.
6. **# CÓMO TRABAJAMOS** — proceso (cuando aplica).
7. **# QUÉ PUEDES HACER** — capacidades positivas.
8. **# QUÉ NO HACER** — guardrails explícitos (no cerrar precios, no diagnosticar, etc.).
9. **# REDIRECCIONES** — frases concretas para derivar al canal correcto.
10. **# CIERRE** — sin CTAs forzados.

Longitud típica: 2.000–3.000 caracteres por idioma. Suficiente sin saturar context window.

## Tokens visuales

Cada paquete de tokens define `--chatbot-*` (bg, fg, accent, bubble, radius, shadow, font). El widget consume CSS vars; los defaults se sobrescriben:

- [`packages/tokens/pro.css`](../../../packages/tokens/pro.css) — apps/es (verde bosque sobre warm stone).
- [`packages/tokens/geek.css`](../../../packages/tokens/geek.css) — apps/tech (verde neón + mono + glow).
- [`packages/tokens/demos-fisio.css`](../../../packages/tokens/demos-fisio.css)
- [`packages/tokens/demos-coach-editorial.css`](../../../packages/tokens/demos-coach-editorial.css)
- [`packages/tokens/demos-coach-vibrant.css`](../../../packages/tokens/demos-coach-vibrant.css)
- [`packages/tokens/demos-tandem.css`](../../../packages/tokens/demos-tandem.css)

**Importante:** el widget NO usa `createPortal`. Se renderiza dentro del árbol natural para que el scope `[data-template="..."]` herede los CSS vars. En demos se monta dentro del shell de cada template via [`apps/demos/components/DemoChatbot.tsx`](../../../apps/demos/components/DemoChatbot.tsx).

## Env var

`GROQ_API_KEY` debe estar en Vercel (Settings → Env Vars, Production + Preview) en los 3 proyectos. Si falta, la API route devuelve 503 y el widget se desactiva silenciosamente.

## Añadir un contexto nuevo (ej: nuevo dominio o nueva demo)

1. **Doc Sanity** — añadir el campo `chatbot` al schema correspondiente (si aún no existe) y publicar la config.
2. **API route** — copiar [`apps/es/app/api/chat/route.ts`](../../../apps/es/app/api/chat/route.ts) y ajustar:
   - `context: "es" | "tech" | "demo"` en `buildSystemPrompt`.
   - Query Sanity adecuada (`getProfileChatbot` para profile, `getDemoSiteBySlug` para demoSite).
3. **Tokens** — añadir bloque `--chatbot-*` en el `.css` de tokens del nuevo contexto.
4. **Render** — montar `<ChatbotWidget>` (apps/es/tech) o `<DemoChatbot>` (apps/demos) en el layout/template, dentro del shell `data-template` si aplica.

## Reglas base (en código, no editables desde Sanity)

[`packages/chatbot/src/server/prompt.ts`](../../../packages/chatbot/src/server/prompt.ts) define dos capas de instrucciones automáticas que se anteponen al system prompt de Sanity:

- **BASE_RULES** — siempre: rol de recepción, no cerrar ventas, respuestas concisas, idioma del usuario, no inventar.
- **CONTEXT_RULES** — por contexto (`es` / `tech` / `demo`): tono, dónde derivar. En demos: aviso explícito de "soy una demo de ebecerra.es".

Cambiar estas reglas → editar el archivo, commit, push. Aplica a todos los contextos del tipo correspondiente.

## Diagnóstico

| Síntoma | Causa probable |
|---|---|
| El botón flotante no aparece | `chatbot.enabled` está en `false` en Sanity, o el doc no se está cargando (verificar fallback `.catch(() => null)`). |
| 503 al enviar mensaje | `GROQ_API_KEY` no está en el env de Vercel. |
| 503 "saturado" | Todos los modelos de la cadena agotaron cuota. Esperar al reset del más caduco (TPM ~1 min, RPD ~24 h). |
| Respuestas genéricas / no conoce el negocio | `systemPrompt` vacío o muy escueto en Sanity. Editar y publicar. |
| Bot habla en idioma equivocado | El cliente está enviando un `locale` incorrecto, o el sistema prompt no tiene la regla "responde en el idioma del usuario". |
| Colores rotos en una demo | El widget se está montando fuera del shell `data-template`. Verificar que `<DemoChatbot>` está dentro del `<div data-template="...">`. |
