---
name: chatbot-system
description: Arquitectura y flujo operativo del chatbot multi-tenant centralizado en apps/es. Úsalo al editar system prompts, provisionar tenants nuevos, debugar el flujo de sync, configurar webhooks, o diagnosticar por qué un bot responde mal.
---

# Chatbot system — ebecerra-web (multi-tenant SaaS, V1 desde 2026-05-21)

Sistema de chatbot **centralizado** en `apps/es` (sirviendo desde `chats.ebecerra.es`) que da servicio a N tenants — apps internas (`apps-es`, `apps-tech`, 4 demos) y proyectos externos (`llaullau` y futuros). Cada tenant tiene su system prompt, branding y quota propios; comparten el motor Groq, la auditoría y el cache.

## Documentación canónica

- **Arquitectura completa**: [docs/chatbot-architecture-2026-05-20.md](../../../docs/chatbot-architecture-2026-05-20.md)
- **Plan de implementación**: [docs/chatbot-implementation-plan-2026-05-20.md](../../../docs/chatbot-implementation-plan-2026-05-20.md)
- **Onboard tenant nuevo**: [docs/chatbot-onboard-new-tenant.md](../../../docs/chatbot-onboard-new-tenant.md)
- **Handoff llaullau**: [docs/chatbot-llaullau-handoff-2026-05-21.md](../../../docs/chatbot-llaullau-handoff-2026-05-21.md) (ya ejecutado)

Esta skill es el **resumen operativo**. Para detalles, ir a los docs.

---

## Arquitectura en una imagen

```
[Visitante]
   ↓ POST <web-cliente>/api/chatbot              ← ruta LOCAL de su web
[Proxy server-side]                              ← inyecta X-Tenant-Key del env
   ↓ POST chats.ebecerra.es/api/v1/chat
[apps/es backend SaaS]
   ↓ validateTenantKey → resolveConfig (Supabase cache) → buildSystemPrompt
   ↓ Groq stream (MODEL_CHAIN con fallback)
   ↓ persist chatbot_messages + chatbot_usage + audit log
   ↑ SSE stream
[Proxy reenvía SSE al navegador]
```

**Clave**: el navegador nunca habla directo con `chats.ebecerra.es`. Cada web tiene un proxy local con su `CHATBOT_TENANT_KEY` server-only. La key nunca toca el cliente.

## Paquetes

| Paquete | Qué hace |
|---|---|
| `@ebecerra/chatbot` | Motor: `streamGroqChat`, `toClientSSE`, `buildSystemPrompt`, `MODEL_CHAIN`. Cliente: `ChatbotWidget`. |
| `@ebecerra/chatbot-saas` | Server SaaS: auth (`validateTenantKey`), config resolver, chat orchestrator (`handleChatRequest`), Sanity webhook handler (`handleSyncWebhook`), quota, audit, DB queries. |
| `@ebecerra/chatbot-admin-ui` | Componentes React reusables: `MessagesView`, `UsageWidget`, `SessionDetail`. |
| `@ebecerra/sanity-chatbot-schema` | Schema `chatbotConfig` singleton standalone para clientes externos con su propio Sanity. **No usado por apps/es/tech/demos** — esos usan el objeto `chatbot` embebido legacy (en `@ebecerra/sanity-schemas`). |
| `@ebecerra/sanity-schemas/schemas/chatbot.ts` | Objeto `chatbot` (legacy) embebido en `profile` (campos `chatbot` y `chatbotTech`) y en `demoSite.chatbot`. Sigue siendo la fuente para apps internas. |

## Tenants provisionados (7 activos, 1 archivado)

| Slug | Sanity project | Documento fuente | Field path | Match type | Notas |
|---|---|---|---|---|---|
| `apps-es` | `gdtxcn4l` | `profile` (UUID 136f3077-…) | `chatbot` | `document_id` | ebecerra.es |
| `apps-tech` | `gdtxcn4l` | mismo profile | `chatbotTech` | `document_id` | ebecerra.tech (comparte profile) |
| `demo-equilibrio` | `gdtxcn4l` | `cbd1babf-304c-…` | `chatbot` | `document_id` | Demo fisio |
| `demo-marta-solana` | `gdtxcn4l` | `169134cb-cedc-…` | `chatbot` | `document_id` | Demo coach editorial |
| `demo-claudia-entrena` | `gdtxcn4l` | `b1fa9a66-caeb-…` | `chatbot` | `document_id` | Demo coach vibrant |
| `demo-eco` | `gdtxcn4l` | `eccf8360-42be-…` | `chatbot` | `document_id` | Demo tandem |
| `llaullau` | `ojtzetld` | `profile-llaullau` | `chatbot` | `document_id` | Repo externo |
| `apps-demos` (archivado) | — | — | — | — | Catch-all sustituido por per-demo |

UUIDs completos y tenant keys raw en Supabase `tenants`. NO se guardan en este repo (filtración de credenciales).

## Base de datos (Supabase central)

| Tabla | Función |
|---|---|
| `tenants` | Registro de cada cliente. `tenant_key_hash` (SHA-256 del raw), `tenant_key_prefix` para UI, `sanity_document_id`, `sanity_match_type`, `sanity_field_path`, `status`, `monthly_message_limit` |
| `chatbot_configs_cache` | Cache 1:1 con tenant. `system_prompt`, `greeting`, `tone`, `language`, `business_info` (jsonb), `faqs` (jsonb), `branding`, `source_revision` |
| `chatbot_messages` | Todos los turnos. `tenant_id` (NOT NULL desde 20260521), `session_id`, `role`, `content`, `tokens_*`, `origin` |
| `chatbot_usage` | Agregados mensuales por tenant para quota |
| `chatbot_audit_log` | `tenant.created`, `key.rotated`, `config.synced`, `quota.exceeded`, `chat.completed`, `chat.failed`, `auth.failed` |

RLS activa con policy `operator_all_*` para owners/editors. Backend usa service_role key (`SUPABASE_SECRET_KEY`) y bypassea RLS.

## API endpoints (`apps/es/app/api/v1/*` + `/api/saas/*`)

| Endpoint | Método | Auth | Función |
|---|---|---|---|
| `/api/v1/chat` | POST | `X-Tenant-Key` | Stream Groq con cadena de fallback, persiste mensajes + usage + audit |
| `/api/v1/config` | GET | `X-Tenant-Key` | Devuelve config pública (greeting, branding) — útil para skeleton del widget |
| `/api/v1/messages` | GET | `X-Tenant-Key` | Lista paginada de mensajes del tenant |
| `/api/v1/sessions` | GET | `X-Tenant-Key` | Resumen agrupado por sesión |
| `/api/v1/usage` | GET | `X-Tenant-Key` | Stats del mes actual o histórico de N meses |
| `/api/saas/sync-config` | POST | HMAC Sanity webhook **o** `X-Tenant-Key` | Recibe doc Sanity, mapea a tenant(s), actualiza `chatbot_configs_cache` |

Todos los endpoints loggean `auth.failed` en audit_log con IP/UA/endpoint cuando la key es inválida (útil para detección de brute-force).

## Subdomain `chats.ebecerra.es`

- Mismo proyecto Vercel que `apps/es`. CNAME en DonDominio → `cname.vercel-dns.com`.
- `apps/es/proxy.ts` (Next 16 — antes `middleware.ts`) detecta `host.startsWith('chats.')` y devuelve 404 para cualquier ruta que no sea `/api/v1/` o `/api/saas/`.
- `apps/es/app/robots.ts` devuelve `Disallow: /` cuando host es `chats.*`.

## Cadena de modelos Groq

[`packages/chatbot/src/server/models.ts`](../../../packages/chatbot/src/server/models.ts) — `MODEL_CHAIN`:

1. `llama-3.3-70b-versatile` (primario, 12K TPM / 100K TPD)
2. `meta-llama/llama-4-scout-17b-16e-instruct` (30K TPM / 500K TPD)
3. `openai/gpt-oss-120b`
4. `qwen/qwen3-32b` (60 RPM)
5. `openai/gpt-oss-20b`
6. `llama-3.1-8b-instant` (último recurso, 14.4K RPD)

429/5xx → siguiente modelo automáticamente. Todos fallan → `GroqExhaustedError` → 503 al cliente.

## Sanity sync — fan-out desde `/api/revalidate`

**Sanity free permite solo 2 webhooks por proyecto** y `gdtxcn4l` ya los tiene ocupados (revalidate de es+demos y revalidate de tech). Solución: **NO añadir webhook dedicado al sync**. El sync se piggybackea sobre los webhooks existentes:

- `apps/es/app/api/revalidate/route.ts`: tras revalidar páginas, si `_type ∈ {profile, demoSite, chatbotConfig}`, llama directamente a `handleSyncWebhook` (función local, sin HTTP, sin auth).
- `llaullau-web/app/api/revalidate/route.ts`: tras revalidar, si `_type ∈ {profile, chatbotConfig}`, forwardea a `chats.ebecerra.es/api/saas/sync-config` con `X-Tenant-Key` (auth alternativa al HMAC).

El webhook de Sanity Manage en cada proyecto solo necesita filter `!(_id in path("drafts.**"))` y projection vacía (envía doc completo). El sync llega automáticamente.

## Editar system prompts

**Fuente de verdad**: Sanity. Vía MCP Sanity (si auth funciona) o curl directo a Sanity Mutate API.

### Documentos fuente y paths

| Tenant | Doc | Path del system prompt |
|---|---|---|
| apps-es | `profile` (136f3077-4754-470c-9f79-663097a57568) | `chatbot.systemPrompt.es` |
| apps-tech | mismo profile | `chatbotTech.systemPrompt.es` |
| demo-* | demoSite UUID respectivo | `chatbot.systemPrompt.es` |
| llaullau | `profile-llaullau` (proyecto `ojtzetld`) | `chatbot.systemPrompt.es` |

### Vía curl (cuando MCP Sanity falla con "Unauthorized organization access")

```bash
# 1. Construir mutation
node -e '
  const fs = require("fs");
  const prompt = fs.readFileSync("/tmp/new-prompt.txt", "utf8");
  const m = { mutations: [{ patch: {
    id: "136f3077-4754-470c-9f79-663097a57568",
    set: { "chatbot.systemPrompt.es": prompt }
  }}]};
  fs.writeFileSync("/tmp/mutation.json", JSON.stringify(m));
'

# 2. POST con SANITY_API_TOKEN (write) de apps/es/.env.local
curl -X POST "https://gdtxcn4l.api.sanity.io/v1/data/mutate/production" \
  -H "Authorization: Bearer $SANITY_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary "@/tmp/mutation.json"
```

Tras el patch, el webhook revalidate dispara automáticamente → fan-out a `handleSyncWebhook` → upsert en `chatbot_configs_cache`. Verificar con:

```sql
select t.slug, c.source_revision, c.synced_at from public.chatbot_configs_cache c
join public.tenants t on t.id = c.tenant_id where t.slug = 'apps-tech';
```

Si el deploy de Vercel con el fan-out aún no está vivo, hacer UPDATE manual a `chatbot_configs_cache` con `source_revision = 'manual-…'` (último recurso).

## Estructura del system prompt (patrón validado)

10-11 secciones en este orden:

1. **# QUIÉN ERES** — rol del bot.
2. **# CONTEXTO IMPORTANTE: ERES UNA DEMO** (solo demos) — recordatorio.
3. **# TONO** — registro, persona, idioma.
4. **# IMPORTANTE — CUANDO TE CONTRADIGAN** (CRÍTICO) — instrucción explícita para que NO niegue capacidades de la web. Si el usuario menciona algo que aparece en proyectos/web, aceptar inmediatamente.
5. **# SOBRE [NEGOCIO/PERSONA]** — bio.
6. **# STACK / SERVICIOS / PROGRAMAS** — listado con detalles.
7. **# PROYECTOS** (tech/apps con portafolio) — referenciables con stack y links.
8. **# QUÉ PUEDES HACER** — capacidades positivas.
9. **# QUÉ NO HACER** — guardrails (no precios inventados, no diagnóstico, **no negar capacidades reales**).
10. **# REDIRECCIONES** — frases concretas para derivar.
11. **# CIERRE** — sin CTAs forzados.

Longitud típica: 2.000–6.000 caracteres. apps-es (más largo, 5934 chars) detalla precios completos.

**Regla aprendida (2026-05-21)**: el bot de tech tendía a negar capacidades cuando se le contradecía ("no, no hago apps móviles" pese a que Piezas está en Google Play). El fix fue añadir la sección "CUANDO TE CONTRADIGAN" + listar proyectos explícitamente en el prompt.

## Provisionar un tenant nuevo

Resumen — detalle en [docs/chatbot-onboard-new-tenant.md](../../../docs/chatbot-onboard-new-tenant.md).

```bash
# 1. Generar key
node -e '
  const c=require("crypto");
  const raw="tk_live_"+c.randomBytes(24).toString("base64url");
  console.log({raw, hash:c.createHash("sha256").update(raw).digest("hex"), prefix:raw.slice(0,15)});
'
```

```sql
-- 2. Provisionar
insert into public.tenants
  (slug, name, config_source, sanity_project_id, sanity_dataset, sanity_workspace,
   sanity_document_id, sanity_match_type, sanity_field_path,
   tenant_key_hash, tenant_key_prefix, monthly_message_limit)
values
  ('<slug>', '<Nombre>', 'sanity_proxy',
   '<projectId>', 'production', '<workspace>',
   '<doc_id>', 'document_id',
   '<field_path o NULL para chatbotConfig singleton>',
   '<hash>', '<prefix>', 5000);

-- 3. Seed inicial (placeholder hasta primer publish)
insert into public.chatbot_configs_cache (tenant_id, system_prompt, greeting, tone, language)
select id, 'Eres asistente de <X>. ...', 'Hola, ¿en qué te ayudo?', 'cordial', 'es'
from public.tenants where slug = '<slug>';
```

```env
# 4. Env vars en Vercel del cliente
CHATBOT_API_URL=https://chats.ebecerra.es
CHATBOT_TENANT_KEY=<raw key del paso 1>
```

```ts
// 5. /api/chatbot proxy en el repo del cliente
export async function POST(req: Request) {
  const upstream = await fetch(`${process.env.CHATBOT_API_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Key': process.env.CHATBOT_TENANT_KEY!,
    },
    body: await req.text(),
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  });
}
```

```tsx
// 6. Componente apuntando al proxy local
<ChatbotWidget apiPath="/api/chatbot" ... />
```

## Diagnóstico

| Síntoma | Causa probable | Cómo investigar |
|---|---|---|
| 401 invalid tenant key | Key mal, env var ausente, tenant `status != active` | `select status from tenants where slug='X'` |
| 503 config_not_synced | `chatbot_configs_cache` vacío para ese tenant | Seed manual o publicar el doc en Sanity |
| 429 quota_exceeded | Tenant superó `monthly_message_limit` | UPDATE el límite o esperar al mes siguiente |
| Bot responde con info desactualizada | Cache no se sincronizó tras editar Sanity | Verificar `synced_at` y `source_revision`; manually UPDATE si webhook no llega |
| Bot niega capacidades reales | System prompt no las menciona, o falta la sección "CUANDO TE CONTRADIGAN" | Editar prompt en Sanity |
| Webhook no actualiza cache | Vercel no deployó el fan-out, o projection de webhook recortada | Verificar último deploy; verificar projection en Sanity Manage |
| Chat persiste audit pero no mensajes | Columna `app` legacy con NOT NULL (ya fixed 2026-05-21) | Si reaparece, revisar la migración drop_app_column |
| `Both middleware file and proxy file detected` build error | Next 16 renombró middleware → proxy. Tener ambos rompe | Eliminar `middleware.ts` y meter la lógica en `proxy.ts` |
| Sanity MCP "Unauthorized organization access" | Auth OAuth del MCP no concedida en la org | Re-autenticar desde Claude Code OAuth, o usar curl con `SANITY_API_TOKEN` |
| `tx.unset([path])` en bucle no surte efecto | Bug: cada call reemplaza, no acumula | Usar `tx.unset(allPaths)` con un solo call |

## Gotchas importantes

1. **Sanity free tier = 2 webhooks máx**. No añadir dedicado al sync; piggybackear sobre revalidate (ver fan-out arriba).
2. **Sanity `tx.unset([path])` en bucle reemplaza en vez de acumular** — pasar todas las paths en una llamada: `tx.unset(paths)`.
3. **Drafts en Sanity tienen sus propios `en` huérfanos** cuando quitas un idioma — limpiar published Y drafts.
4. **Multi-tenant matching**: un doc puede mapear a N tenants (apps-es y apps-tech comparten `profile`). El webhook handler itera todos los matches.
5. **DB/Sanity/Groq son los mismos en local y prod** — `CHATBOT_API_URL` default es `https://chats.ebecerra.es` también en `.env.local`. Solo cambiar a localhost cuando se itere sobre `chatbot-saas`.
6. **Env var convention**: `SUPABASE_SECRET_KEY` (no `SUPABASE_SERVICE_ROLE_KEY`).
7. **Bug histórico (2026-05-21, ya arreglado)**: columna `app` legacy con `NOT NULL CHECK` hacía fallar inserts en silencio. La migración `20260521140000` la dropeó. Si reaparece un error de persistencia, mirar `chatbot_audit_log` con action `chat.failed`.

## Smoke test rápido

```bash
# Curl directo al endpoint
curl -X POST "https://chats.ebecerra.es/api/v1/chat/" \
  -H "X-Tenant-Key: $TENANT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"smoke-1","messages":[{"role":"user","content":"hola"}]}'

# Stream esperado:
# data: {"type":"text","value":"Hola"}
# data: {"type":"text","value":"!"}
# ...
# data: {"type":"done","model":"llama-3.3-70b-versatile"}
```

## Roadmap V2 (anotado, NO implementar sin demanda)

- Widget `<script>` para WordPress / sitios sin acceso al servidor.
- Public API keys con `allowed_domains[]` (auth alternativa al X-Tenant-Key).
- Stripe Checkout + Customer Portal + webhooks para self-service billing.
- Onboarding wizard self-service en `apps/es/chatbot`.
- Landing pública con pricing.
- `central_supabase` config_source para tenants externos sin Sanity propio.

Detalle en [docs/chatbot-architecture-2026-05-20.md](../../../docs/chatbot-architecture-2026-05-20.md) sección "Roadmap V2".
