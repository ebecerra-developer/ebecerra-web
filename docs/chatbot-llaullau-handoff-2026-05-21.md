# Migración de llaullau-web al chatbot multi-tenant — Handoff

**Doc de arquitectura**: [chatbot-architecture-2026-05-20.md](./chatbot-architecture-2026-05-20.md)
**Plan general**: [chatbot-implementation-plan-2026-05-20.md](./chatbot-implementation-plan-2026-05-20.md)

Este documento es **autocontenido** y describe la migración del chatbot de **llaullau-web** (repo separado) del modelo legacy (motor copy-pasted, system prompt en su Sanity, log a Supabase central por columna `app`) al nuevo modelo multi-tenant.

Puedes ejecutarlo tú a mano, o lanzar un subagente con el prompt que viene al final de este doc.

## Estado actual de llaullau-web (lo que sabes)

- Repo separado del monorepo `ebecerra-web`.
- Tiene su propio Sanity workspace (project ID distinto al de ebecerra-web).
- El chatbot del motor lo tiene **copy-pasted manualmente** desde `ebecerra-web/packages/chatbot/`. Mantener sincronía es pesado ([project_chatbot_llaullau_sync](memory:project_chatbot_llaullau_sync)).
- Los mensajes se logean en Supabase central con columna `app='llaullau'`. El tenant_id está vacío.

## Estado destino

- Llaullau-web es un **tenant** en el sistema multi-tenant.
- El motor `@ebecerra/chatbot` se importa vía Git URL versionada (no copy-paste).
- El chatbot config vive en el Sanity de llaullau como singleton `chatbotConfig` (paquete `@ebecerra/sanity-chatbot-schema`).
- Al publicar en Studio, webhook → `chats.ebecerra.es/api/saas/sync-config?project=<llaullau_project_id>` → Supabase cache.
- La web hace fetch a `/api/chatbot` (proxy server-side) que reenvía a `chats.ebecerra.es/api/v1/chat` con `X-Tenant-Key`.
- Laura (cliente) ve mensajes en `llaullau.com/admin/chatbot/mensajes` (vía componente `<MessagesView />` del paquete `@ebecerra/chatbot-admin-ui`).

## Pasos

### 1. Provisionar tenant `llaullau` en la DB central

```sql
-- Generar key con un node oneliner desde tu máquina:
--   node -e 'const c=require("crypto"); const r=c.randomBytes(24).toString("base64url"); const k="tk_live_"+r; console.log({raw:k, hash:c.createHash("sha256").update(k).digest("hex"), prefix:k.slice(0,15)})'

insert into public.tenants
  (slug, name, config_source, sanity_project_id, sanity_dataset, sanity_workspace,
   sanity_document_id, sanity_match_type, sanity_field_path,
   tenant_key_hash, tenant_key_prefix, monthly_message_limit)
values
  ('llaullau', 'llaullau.com', 'sanity_proxy',
   '<LLAULLAU_SANITY_PROJECT_ID>',         -- consultar en sanity.io/manage del workspace de llaullau
   '<LLAULLAU_SANITY_DATASET>',             -- típicamente 'production'
   '<LLAULLAU_SANITY_WORKSPACE>',           -- el name del workspace en sanity.config.ts
   'chatbotConfig',                          -- singleton standalone
   'document_id',                            -- match exacto en _id
   NULL,                                     -- IMPORTANTE: chatbotConfig es config en root, no subcampo
   '<HASH_DEL_KEY>',
   '<PREFIX_DEL_KEY>',
   10000)
returning id;
```

Guarda el `id` del tenant y el `raw` key (este último se mete en env vars de Vercel de llaullau).

### 2. Seed inicial del config en `chatbot_configs_cache`

Antes de que el webhook Sanity dispare por primera vez, hace falta un placeholder para que el endpoint `/api/v1/chat` no devuelva 503:

```sql
insert into public.chatbot_configs_cache
  (tenant_id, system_prompt, greeting, tone, language, primary_color)
values
  ('<TENANT_ID_DE_LLAULLAU>',
   'Eres el asistente virtual de llaullau.com. Responde sobre los servicios con tono cordial. No inventes precios — redirige a contacto cuando alguien pida presupuesto.',
   'Hola, ¿en qué puedo ayudarte?',
   'cordial',
   'es',
   '<LLAULLAU_PRIMARY_HEX>');
```

### 3. En el repo llaullau-web — añadir dependencias

En `package.json` de llaullau-web, añadir:

```json
{
  "dependencies": {
    "@ebecerra/chatbot": "github:ebecerra/chatbot-pkg#v0.1.0",
    "@ebecerra/sanity-chatbot-schema": "github:ebecerra/sanity-chatbot-schema-pkg#v0.1.0",
    "@ebecerra/chatbot-admin-ui": "github:ebecerra/chatbot-admin-ui-pkg#v0.1.0"
  }
}
```

> **Nota**: los repos GitHub independientes para los paquetes aún no existen. Mientras tanto, copia los paquetes manualmente:
>
> 1. Copia `ebecerra-web/packages/chatbot/`, `ebecerra-web/packages/sanity-chatbot-schema/` y `ebecerra-web/packages/chatbot-admin-ui/` a una carpeta `packages/` en llaullau-web (si no es monorepo, instala via path local `"file:./packages/chatbot"`).
> 2. O simplemente vendor-copy los archivos `.ts/.tsx` dentro de `lib/` y `app/` de llaullau-web.
>
> El plan a futuro es publicarlos como paquetes Git URL versionados.

`npm install` después.

### 4. Integrar schema en Sanity de llaullau

```ts
// llaullau-web/sanity.config.ts (o equivalente)
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import {
  chatbotConfigSchemas,
  chatbotConfigStructure,
} from '@ebecerra/sanity-chatbot-schema';

export default defineConfig({
  // ...existing config
  schema: {
    types: [
      ...existingSchemas,
      ...chatbotConfigSchemas,
    ],
  },
  plugins: [
    structureTool({
      structure: (S) => S.list().title('Contenido').items([
        // ...existing items
        S.divider(),
        chatbotConfigStructure(S),
      ]),
    }),
  ],
});
```

**localeString / localeText**: el paquete asume que existen. Si llaullau no los tiene definidos, copia las definiciones de `ebecerra-web/packages/sanity-schemas/schemas/locale.ts`.

**Deploy schema**:

```bash
cd llaullau-web
npx sanity schema deploy --workspace <llaullau-workspace-name>
```

### 5. Crear el documento `chatbotConfig` inicial en Studio

Entra en `llaullau.com/studio` (o donde tengan el Studio), crea el singleton `chatbotConfig` y rellena:

- **System prompt**: lo que el bot debe saber del negocio (servicios, tono, qué redirige a humano).
- **Greeting**: saludo inicial.
- **Tone**: cordial / formal / cercano / técnico.
- **Business info**: nombre, descripción, horarios, servicios, contact.
- **FAQs**: 5-8 preguntas iniciales.

### 6. Configurar Vercel env vars en llaullau

Añadir a Vercel project de llaullau:

```
CHATBOT_API_URL=https://chats.ebecerra.es
CHATBOT_TENANT_KEY=<RAW_KEY_GENERADO_EN_PASO_1>
```

### 7. Crear `/api/chatbot/route.ts` en llaullau (proxy server-side)

```ts
// llaullau-web/app/api/chatbot/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiUrl = process.env.CHATBOT_API_URL;
  const tenantKey = process.env.CHATBOT_TENANT_KEY;
  if (!apiUrl || !tenantKey) {
    return new Response("Chatbot not configured", { status: 503 });
  }
  const body = await request.text();
  const upstream = await fetch(`${apiUrl}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Key": tenantKey,
    },
    body,
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
```

### 8. Sustituir el componente Chatbot actual

Donde llaullau renderiza el chat (probablemente en su Layout o Page), reemplazar el componente actual (que llama al motor copiado) por uno que llama al nuevo proxy.

Si el `ChatbotWidget` que tienen ya consume un endpoint `/api/chat`, simplemente:
- Renombrar el endpoint actual a `/api/chatbot-legacy` (para tener fallback)
- Que el widget apunte a `/api/chatbot` (el nuevo proxy)

### 9. Configurar webhook en Sanity Manage UI

1. Ir a https://sanity.io/manage → workspace de llaullau → API → Webhooks.
2. Crear nuevo webhook:
   - **Name**: `chatbot-config-sync`
   - **URL**: `https://chats.ebecerra.es/api/saas/sync-config?project=<llaullau_project_id>`
   - **Dataset**: `production` (o el que corresponda)
   - **Trigger on**: `Create`, `Update`
   - **Filter (GROQ)**: `_type == "chatbotConfig"`
   - **HTTP method**: POST
   - **Secret**: usa el mismo valor que `SANITY_WEBHOOK_SECRET` en Vercel del proyecto `apps/es` (el que recibe el webhook).

### 10. Crear admin section en llaullau

```tsx
// llaullau-web/app/admin/chatbot/mensajes/page.tsx
import { MessagesView } from '@ebecerra/chatbot-admin-ui';

export default function Page() {
  return <MessagesView apiPath="/api/admin/chatbot" />;
}
```

Y el API proxy:

```ts
// llaullau-web/app/api/admin/chatbot/sessions/route.ts
export async function GET() {
  const r = await fetch(`${process.env.CHATBOT_API_URL}/api/v1/sessions`, {
    headers: { "X-Tenant-Key": process.env.CHATBOT_TENANT_KEY! },
  });
  return new Response(r.body, { status: r.status, headers: { "Content-Type": "application/json" } });
}

// llaullau-web/app/api/admin/chatbot/messages/route.ts
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = new URLSearchParams();
  const session = url.searchParams.get("session");
  if (session) params.set("session", session);
  const r = await fetch(`${process.env.CHATBOT_API_URL}/api/v1/messages?${params}`, {
    headers: { "X-Tenant-Key": process.env.CHATBOT_TENANT_KEY! },
  });
  return new Response(r.body, { status: r.status, headers: { "Content-Type": "application/json" } });
}
```

Auth: gateado por la auth que llaullau ya tenga (no es problema del chatbot — es la auth del admin de llaullau).

### 11. Validar end-to-end

- [ ] Abrir el chatbot en llaullau.com — mandar mensaje, verificar que responde.
- [ ] Editar FAQ en Studio, publicar — verificar que el siguiente mensaje refleja el cambio.
- [ ] Entrar en `llaullau.com/admin/chatbot/mensajes` — ver la conversación de prueba.
- [ ] Verificar en `chatbot_audit_log` (Supabase central) que aparecen entries `config.synced` y `chat.completed` con el tenant_id de llaullau.

### 12. Desmontar el chatbot legacy

Una vez validado:
- Eliminar el código copy-pasted del motor en llaullau.
- Eliminar el endpoint legacy `/api/chat` (si existe).
- Eliminar el system prompt del schema viejo de Sanity de llaullau (si era un campo diferente).
- Quitar columna `app='llaullau'` del log — los nuevos mensajes ya van con `tenant_id`. Los mensajes viejos quedan archivados.

---

## Prompt para subagente (opcional)

Si prefieres delegar la migración a un agente desde llaullau-web, copia este prompt y úsalo cuando arranques Claude Code dentro del repo de llaullau:

```
Voy a migrar el chatbot de llaullau-web al nuevo sistema multi-tenant centralizado en chats.ebecerra.es.

Contexto técnico (ya hecho en otro repo, ebecerra-web):
- Sistema multi-tenant con tabla `tenants` en Supabase central
- API en chats.ebecerra.es/api/v1/chat (auth via X-Tenant-Key server-to-server)
- Webhook receiver en chats.ebecerra.es/api/saas/sync-config para sincronizar config desde Sanity
- Paquetes: @ebecerra/chatbot (motor), @ebecerra/sanity-chatbot-schema (Sanity schemas), @ebecerra/chatbot-admin-ui (componentes admin)

Lo que tengo del provisioning del tenant:
- tenant_id: <PEGA EL UUID GENERADO EN PASO 1>
- raw key (para env var): <PEGA EL RAW KEY>
- sanity_project_id de llaullau: <CONSULTA>
- sanity_document_id: chatbotConfig (singleton standalone)

Tareas:
1. Añadir los 3 paquetes al package.json (vía vendor copy desde ebecerra-web/packages/ o git URL si están publicados).
2. Integrar chatbotConfigSchemas + chatbotConfigStructure en sanity.config.ts.
3. Deploy schema con npx sanity schema deploy.
4. Crear /api/chatbot/route.ts como proxy server-side a chats.ebecerra.es/api/v1/chat.
5. Sustituir el componente Chatbot actual (que tira del motor copiado) por uno que llame a /api/chatbot local.
6. Crear /admin/chatbot/mensajes/page.tsx con <MessagesView /> + /api/admin/chatbot/sessions y /api/admin/chatbot/messages proxies.
7. Añadir env vars CHATBOT_API_URL y CHATBOT_TENANT_KEY al .env.local y a Vercel.
8. Después de mi confirmación, ayudarme a configurar el webhook en Sanity Manage UI (manual).

No toques nada que esté funcionando en producción hasta que yo valide en preview. Crea ruta nueva en paralelo a la vieja primero (`/api/chatbot` nueva vs `/api/chat` vieja), valido, después cambio el componente.

Sigue el doc de referencia en ebecerra-web: docs/chatbot-llaullau-handoff-2026-05-21.md
```

---

## TODOs después de migrar llaullau

- Limpieza de mensajes legacy con `app='llaullau'` y `tenant_id` null. Backfill `tenant_id` desde el slug si quieres histórico unificado.
- Pull request en llaullau-web con el cambio completo, branch `chore/chatbot-multitenant-migration`.
- Actualizar memoria [project_chatbot_llaullau_sync](memory:project_chatbot_llaullau_sync) reflejando que ya no hay copy-paste.
