# Guía: dar de alta un tenant nuevo en el chatbot

Receta paso a paso para añadir un cliente nuevo al sistema multi-tenant.

Hay dos casos según el cliente:

| Caso | Quién | Schema Sanity |
|---|---|---|
| **A · Cliente externo** | Webs que tú haces para terceros (llaullau, futuras Lauras) | `@ebecerra/sanity-chatbot-schema` (singleton standalone) |
| **B · Tenant interno** | apps/es, apps/tech, apps/demos | Usa `chatbot` embebido en `profile`/`demoSite` (existente en `@ebecerra/sanity-schemas`) |

Para **Caso A** sigue todos los pasos. Para **Caso B**, ya están provisionados los 3 tenants (apps-es / apps-tech / apps-demos) — sólo necesitas migrar los componentes Chatbot cuando estés listo (ver § Migración del chatbot actual).

---

## Caso A — Cliente externo

### 1. Generar tenant key

```bash
node -e '
const c = require("crypto");
const raw = "tk_live_" + c.randomBytes(24).toString("base64url");
const hash = c.createHash("sha256").update(raw).digest("hex");
console.log(JSON.stringify({raw, hash, prefix: raw.slice(0,15)}, null, 2));
'
```

Guarda los tres valores. El `raw` se pone en env var del cliente; el `hash` y `prefix` van a la DB.

### 2. Provisionar tenant en Supabase

```sql
insert into public.tenants
  (slug, name, config_source, sanity_project_id, sanity_dataset, sanity_workspace,
   sanity_document_id, sanity_match_type, sanity_field_path,
   tenant_key_hash, tenant_key_prefix, monthly_message_limit)
values
  ('<slug-cliente>',           -- ej. 'alejandra-fisio'
   '<Nombre comercial>',
   'sanity_proxy',
   '<sanity_project_id>',       -- consultar en sanity.io/manage del workspace del cliente
   '<dataset>',                  -- típicamente 'production'
   '<workspace_name>',
   'chatbotConfig',              -- singleton standalone
   'document_id',                -- match exacto en _id
   NULL,                          -- IMPORTANTE: el config vive en root del doc, no en un subcampo
   '<HASH>',
   '<PREFIX>',
   5000)
returning id;
```

**Sobre `sanity_match_type` y `sanity_field_path`** (importante):

| Caso | `sanity_match_type` | `sanity_document_id` | `sanity_field_path` |
|---|---|---|---|
| Tenant externo con `chatbotConfig` singleton | `document_id` | `chatbotConfig` | `NULL` |
| Tenant interno leyendo `profile.chatbot` (apps-es) | `document_id` | `profile` | `chatbot` |
| Tenant interno leyendo `profile.chatbotTech` (apps-tech) | `document_id` | `profile` | `chatbotTech` |
| Tenant interno por _type (apps-demos) | `document_type` | `demoSite` | `chatbot` |

Los defaults son `document_id` + `chatbot` — pensados para el caso "embebido" interno. Para tenants externos con singleton standalone, sobreescribe `sanity_field_path = NULL`.

Guarda el `id` (UUID del tenant).

### 3. Seed inicial del config (placeholder)

Antes de que Sanity webhook dispare por primera vez:

```sql
insert into public.chatbot_configs_cache
  (tenant_id, system_prompt, greeting, tone, language, primary_color)
values
  ('<TENANT_ID>',
   'Eres el asistente virtual de [Nombre]. Responde con tono cordial sobre los servicios. No inventes precios — redirige a contacto.',
   'Hola, ¿en qué puedo ayudarte?',
   'cordial',
   'es',
   '#047857');
```

### 4. En el repo del cliente — añadir paquetes

```json
// package.json
"dependencies": {
  "@ebecerra/chatbot": "<git url o vendor>",
  "@ebecerra/sanity-chatbot-schema": "<...>",
  "@ebecerra/chatbot-admin-ui": "<...>"
}
```

Si los paquetes no están publicados aún, vendor-copy desde `ebecerra-web/packages/`.

### 5. Integrar schema en Sanity del cliente

```ts
// sanity.config.ts
import { chatbotConfigSchemas, chatbotConfigStructure } from '@ebecerra/sanity-chatbot-schema';
// ...
schema: { types: [...existing, ...chatbotConfigSchemas] }
plugins: [
  structureTool({ structure: (S) => S.list().items([...existing, S.divider(), chatbotConfigStructure(S)]) })
]
```

Asegúrate de que el host tiene `localeString` y `localeText` definidos (copia desde `ebecerra-web/packages/sanity-schemas/schemas/locale.ts` si no).

### 6. Deploy schema

```bash
cd <repo-cliente>
npx sanity schema deploy --workspace <workspace_name>
```

### 7. Crear el singleton `chatbotConfig` en Studio

Entra en `<dominio-cliente>/studio` (o donde tengan Studio), crea el doc `chatbotConfig` y rellena system_prompt, greeting, tone, business_info, faqs.

### 8. Env vars en Vercel del cliente

```
CHATBOT_API_URL=https://chats.ebecerra.es
CHATBOT_TENANT_KEY=<raw_key del paso 1>
```

### 9. `/api/chatbot/route.ts` en el cliente

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const upstream = await fetch(`${process.env.CHATBOT_API_URL}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Key": process.env.CHATBOT_TENANT_KEY!,
    },
    body,
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
```

### 10. Componente Chatbot que use el proxy local

Reusar `@ebecerra/chatbot/client` con `apiUrl="/api/chatbot"`.

### 11. Admin en el cliente

```tsx
// app/admin/chatbot/mensajes/page.tsx
import { MessagesView } from '@ebecerra/chatbot-admin-ui';
export default function Page() {
  return <MessagesView apiPath="/api/admin/chatbot" />;
}
```

```ts
// app/api/admin/chatbot/sessions/route.ts
export async function GET() {
  const r = await fetch(`${process.env.CHATBOT_API_URL}/api/v1/sessions`, {
    headers: { "X-Tenant-Key": process.env.CHATBOT_TENANT_KEY! },
  });
  return new Response(r.body, { status: r.status });
}
// Idem para /messages, /usage
```

### 12. Configurar webhook en Sanity Manage UI

1. https://sanity.io/manage → workspace del cliente → API → Webhooks → Add webhook.
2. URL: `https://chats.ebecerra.es/api/saas/sync-config?project=<SANITY_PROJECT_ID>`
3. Dataset: `production`
4. Trigger on: Create + Update
5. Filter: `_type == "chatbotConfig"`
6. HTTP method: POST
7. Secret: el valor de `SANITY_WEBHOOK_SECRET` en Vercel de `apps/es`.

### 13. Smoke test

- [ ] Chatbot responde en el sitio del cliente.
- [ ] Editar FAQ en Studio refleja en la siguiente respuesta.
- [ ] Mensajes aparecen en `<cliente>.com/admin/chatbot/mensajes`.
- [ ] Mensajes aparecen en operator admin `ebecerra.es/admin/chatbot/tenants/<id>`.

---

## Caso B — Tenant interno (apps/es / apps/tech / apps/demos)

Ya provisionados en 2026-05-21. Keys en `docs/chatbot-tenant-keys-PROVISIONED.md` (borrar después de configurar).

### Migración del chatbot actual

Los chatbots actuales (`apps/es/app/api/chat/route.ts`, equivalentes en apps/tech y apps/demos) siguen funcionando con el modelo legacy. Cuando quieras migrarlos:

1. En el componente cliente, cambiar `apiUrl="/api/chat"` → `apiUrl="/api/chatbot"`.
2. Crear `apps/<X>/app/api/chatbot/route.ts` (proxy a chats.ebecerra.es como en Caso A paso 9).
3. Verificar.
4. Cuando confirme que va bien, eliminar `app/api/chat/route.ts` legacy (apps/es) y `lib/chatbot-log.ts` (ya no necesario, el logging lo hace chatbot-saas).

**Nota apps-es y apps-tech comparten `profile`**: cuando el webhook actualiza profile.chatbot, AMBOS tenants reciben el config. Si quieres diferenciar tono entre .es y .tech, editar el `system_prompt` cacheado de uno via SQL (no se sobrescribirá hasta que se vuelva a publicar profile en Sanity).

**Nota apps-demos**: tiene `sanity_document_id='demoSite'`. Cualquier demoSite que publique disparará webhook, pero solo hay UN tenant para todas las demos. Si en el futuro quieres tenant por-demo, provisiona uno nuevo por cada demoSite con `sanity_document_id='<demoSite_id_específico>'`.

---

## Troubleshooting

| Síntoma | Probable causa | Fix |
|---|---|---|
| 401 invalid tenant key | Key mal copiada, o falta env var, o tenant `status != active` | Verificar env var, comprobar `select status from tenants where slug='...'` |
| 503 config_not_synced | `chatbot_configs_cache` vacío para ese tenant | Seed manual (paso 3) o publicar el doc Sanity para disparar webhook |
| 429 quota_exceeded | Tenant superó `monthly_message_limit` | Subir el límite vía SQL o esperar al mes siguiente |
| Webhook no llega a Supabase | Firma HMAC inválida o URL mal configurada en Sanity | Verificar `SANITY_WEBHOOK_SECRET` coincide, ver logs de Vercel del webhook receiver |
| Mensajes no aparecen en admin | RLS bloqueando lectura | El admin usa service_role key — verificar `SUPABASE_SERVICE_ROLE_KEY` |
