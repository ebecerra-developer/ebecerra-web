# Arquitectura — Chatbot multi-tenant (V1 cliente-only) — 2026-05-20

## Resumen ejecutivo

Convertir el motor de chatbot existente ([@ebecerra/chatbot](../packages/chatbot/), hoy embebido en `apps/es`, `apps/tech`, `apps/demos` y portado manualmente a llaullau-web) en un **sistema multi-tenant** centralizado en `ebecerra.es`, donde cada web pasa a ser un *tenant* con su propia config, mensajes y uso.

**Alcance V1**: solo webs que tú has construido (Next.js, tu stack). Cinco principios arquitectónicos garantizan que V2 (modo SaaS público con widget WordPress, Stripe y self-service) sea una **extensión sin reescritura**.

**No incluido en V1**: widget `<script>` para webs ajenas, Stripe, onboarding self-service, página pública de pricing del chatbot. Anotado en § Roadmap V2.

---

## Cinco principios de diseño que hacen reversible el modelo

| # | Principio | Por qué |
|---|---|---|
| 1 | **Multi-tenant desde el día 1** | Cada web (apps/es, apps/tech, apps/demos, llaullau, futuros) es un `tenant_id`. No hay configs hardcoded por dominio. |
| 2 | **API-first incluso para código propio** | El componente React en `apps/es` hace `fetch('/api/v1/chat')` con auth, igual que cualquier consumidor externo. En V2, el widget público llama al mismo endpoint con auth distinta — cero cambios en el resto. |
| 3 | **Auth como capa abstraída** | V1: `X-Tenant-Key` server-to-server. V2: añadir `X-Api-Key` con domain check, coexistiendo. La función `authenticate()` resuelve cualquiera de los dos sin que el resto sepa. |
| 4 | **Config resolution polimórfica** | `tenants.config_source ∈ { 'sanity_proxy' \| 'central_supabase' \| 'inline' }`. V1 solo usa `sanity_proxy`. V2 desbloquea `central_supabase` para clientes sin Sanity (WordPress). |
| 5 | **Mensajes y usage en Supabase central desde V1** | Aunque V1 no tenga billing, los datos están donde tienen que estar. V2 añade `stripe_*` y `api_keys` sin migrar lo existente. |

---

## Actores

| Actor | Quién | Dónde interactúa |
|---|---|---|
| **End user** | Visitante en web de cliente | Componente `<Chatbot />` nativo en su Next.js |
| **Cliente con Sanity** | Laura (llaullau), Enrique (apps/es/tech/demos) | Edita config en su propio Studio · ve mensajes en `<su-dominio>/admin/chatbot/mensajes` |
| **Cliente sin Sanity** | (V2, ej. Alejandra WordPress) | Edita config en `ebecerra.es/admin/chatbot` · ve todo desde ahí |
| **Operador** | Enrique | Panel `ebecerra.es/admin/chatbot` (lista tenants, ve todos los mensajes, audit) |

---

## Stack y decisiones de infra

| Pieza | Tecnología | Por qué |
|---|---|---|
| Backend API | Next.js API routes en `apps/es` (Vercel) | Reuso del deployment actual |
| Dominio API | `chats.ebecerra.es` (custom domain del mismo Vercel project) | Aislamiento mental + V2 cutover sin cambios |
| DB | **Supabase** (multi-tenant) | Ya en uso ([project_admin_panel](memory:project_admin_panel)), RLS nativa, free tier holgado |
| Config editorial | **Sanity** del cliente (cuando tenga uno) | Es contenido — el cliente ya edita ahí |
| Cache de config | Supabase (`chatbot_configs_cache`) | Lectura rápida en cada chat sin GROQ-fetch a Sanity |
| LLM | **Groq** (free tier en V1, paid al primer cliente externo con datos sensibles) | Coste ridículo, latencia bajísima |
| Auth admin operador | OAuth Google/GitHub (extiende `app_admins`) | Reuso 100% |
| Auth admin cliente | Server-to-server con `CHATBOT_TENANT_KEY` env var en su web | Sin cross-domain auth complicada |
| Auth widget (V1) | Mismo `CHATBOT_TENANT_KEY`, server-side proxy | Cero superficie pública |
| Auth widget (V2) | `X-Api-Key` público + `allowed_domains` check | Estándar SaaS |

**Decisión clave: Supabase central para mensajes, Sanity del cliente para config.**

- Sanity es CMS editorial → perfect fit para FAQ/prompt/branding (contenido) editados por el cliente.
- Supabase es transaccional/multi-tenant → fit para mensajes, usage, audit, tenant registry.
- La sincronización es vía webhook Sanity → Supabase cache. **Sanity edita, Supabase sirve.**

---

## Modelo de datos

### Supabase (central, fuente de verdad operativa)

```sql
-- ============================================================
-- TENANTS — registro de cada web/cliente
-- ============================================================
create table tenants (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,           -- 'apps-es', 'llaullau', 'alejandra'...
  name                text not null,
  config_source       text not null default 'sanity_proxy'
                        check (config_source in ('sanity_proxy','central_supabase','inline')),
  -- Solo si config_source = 'sanity_proxy'
  sanity_project_id   text,
  sanity_dataset      text,
  sanity_workspace    text,
  -- Auth V1 (server-to-server)
  tenant_key_hash     text not null unique,            -- sha256 del key, nunca el raw
  tenant_key_prefix   text not null,                   -- 'tk_live_abc12' para identificar en UI
  -- Operativo
  status              text not null default 'active'
                        check (status in ('active','paused','archived')),
  monthly_message_limit  int not null default 5000,    -- generoso por defecto en V1
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index on tenants (status);
create index on tenants (config_source);

-- ============================================================
-- CONFIG CACHE — sincronizado vía webhook desde Sanity del tenant
-- (también es la fuente directa cuando config_source = 'central_supabase')
-- ============================================================
create table chatbot_configs_cache (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null unique references tenants(id) on delete cascade,
  -- Comportamiento
  system_prompt   text not null,
  greeting        text not null default 'Hola, ¿en qué puedo ayudarte?',
  tone            text not null default 'cordial'
                    check (tone in ('cordial','formal','cercano','tecnico')),
  language        text not null default 'es',
  -- Contexto del negocio
  business_info   jsonb not null default '{}'::jsonb,
  faqs            jsonb not null default '[]'::jsonb,
  -- Branding del widget
  primary_color   text not null default '#047857',
  position        text not null default 'bottom-right',
  avatar_url      text,
  bubble_label    text default '¿Necesitas ayuda?',
  -- LLM
  model           text not null default 'llama-3.1-70b-versatile',
  -- Meta
  synced_at       timestamptz not null default now(),
  source_revision text                                  -- rev de Sanity, para idempotencia
);

-- ============================================================
-- MESSAGES — todos los turnos
-- ============================================================
create table chatbot_messages (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  session_id     uuid not null,
  role           text not null check (role in ('user','assistant','system')),
  content        text not null,
  tokens_input   int default 0,
  tokens_output  int default 0,
  origin         text,                                  -- referer header, opcional
  created_at     timestamptz not null default now()
);

create index on chatbot_messages (tenant_id, created_at desc);
create index on chatbot_messages (tenant_id, session_id, created_at);

-- ============================================================
-- USAGE — agregados mensuales para quota + facturación futura
-- ============================================================
create table chatbot_usage (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references tenants(id) on delete cascade,
  period_start         date not null,                  -- 1 del mes
  conversations_count  int not null default 0,
  messages_count       int not null default 0,
  tokens_total         int not null default 0,
  unique (tenant_id, period_start)
);

-- ============================================================
-- AUDIT LOG — seguridad, compliance
-- ============================================================
create table chatbot_audit_log (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references tenants(id) on delete cascade,
  actor_email  text,
  action       text not null,                          -- 'tenant.created', 'key.rotated', 'config.synced'...
  details      jsonb,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
alter table tenants                 enable row level security;
alter table chatbot_configs_cache   enable row level security;
alter table chatbot_messages        enable row level security;
alter table chatbot_usage           enable row level security;
alter table chatbot_audit_log       enable row level security;

-- El backend usa service_role key — bypasea RLS, es fuente de verdad.
-- Las policies abajo son para futuros consumos directos (V2, admin de cliente con JWT propio).

-- Política operator: cualquier admin en app_admins (whitelist existente) ve todo.
create policy operator_all on tenants
  for all using (
    auth.jwt() ->> 'email' in (select email from app_admins where role = 'admin')
  );

-- Replicar similar policy en las otras tablas (messages, usage, audit).
```

### Sanity (per-tenant, fuente de verdad de la config editorial)

Paquete nuevo `@ebecerra/sanity-chatbot-schema` exporta:

```ts
// chatbotConfig — singleton por workspace
{
  _type: 'chatbotConfig',
  systemPrompt: localeText,
  greeting: localeString,
  tone: 'cordial' | 'formal' | 'cercano' | 'tecnico',
  language: 'es' | 'en',
  businessInfo: {
    name: string,
    description: localeText,
    address: string,
    hours: string,
    services: localeText,
    contactWhatsapp: string,
  },
  faqs: Array<{
    question: localeString,
    answer: localeText,
    tags: string[],
  }>,
  branding: {
    primaryColor: string,
    position: 'bottom-right' | 'bottom-left',
    avatarUrl: image,
    bubbleLabel: localeString,
  },
  model: 'llama-3.1-70b-versatile' | 'llama-3.1-8b-instant' | ...,
}
```

Cuando el editor publica desde Studio → Sanity dispara webhook a `chats.ebecerra.es/api/saas/sync-config` → upsert en `chatbot_configs_cache`.

---

## APIs

### V1 — públicas (autenticadas con tenant key, server-to-server)

```
POST   /api/v1/chat
  Headers: X-Tenant-Key: tk_live_xxx...
  Body:    { sessionId: uuid, messages: [{role, content}] }
  Returns: SSE stream con tokens del modelo
  Side fx: append a chatbot_messages, upsert chatbot_usage

GET    /api/v1/config
  Headers: X-Tenant-Key
  Returns: config pública del tenant (greeting, branding) para que el cliente renderice
           el componente sin tener que duplicar el branding en su código

GET    /api/v1/messages
  Headers: X-Tenant-Key
  Query:  ?session=<uuid>&from=<iso>&limit=<n>
  Returns: lista paginada de mensajes del tenant. Usada por admin de cliente.
```

### V1 — webhook receivers

```
POST   /api/saas/sync-config
  Headers: Authorization (Sanity webhook secret)
  Body:    documento publicado de Sanity
  Side fx: upsert chatbot_configs_cache por tenant_id (resuelto vía sanity_project_id)
```

### V1 — operador (auth OAuth admin)

```
GET    /api/admin/chatbot/tenants
GET    /api/admin/chatbot/tenants/[id]
POST   /api/admin/chatbot/tenants          (provision tenant + generate key)
PATCH  /api/admin/chatbot/tenants/[id]
DELETE /api/admin/chatbot/tenants/[id]     (soft, archive)
POST   /api/admin/chatbot/tenants/[id]/rotate-key
GET    /api/admin/chatbot/messages?tenantId=&from=
```

### V2 — añadidos (no implementar)

```
POST   /api/v1/chat                        # añade aceptar X-Api-Key (público)
GET    /api/v1/config/widget               # endpoint público para loader del widget
POST   /api/stripe/checkout
POST   /api/stripe/portal
POST   /api/stripe/webhook
```

---

## Paquetes del monorepo

Tres paquetes nuevos + refactor del motor existente:

### `packages/chatbot/` (refactor del existente)

Hoy está acoplado a Sanity. Refactor pequeño: motor acepta `systemPrompt` y `model` como parámetros.

**Antes:**
```ts
export async function respond(messages) {
  const ctx = await fetchSanityContext();             // ← acoplado
  return groq.chat({ messages, system: buildPrompt(ctx) });
}
```

**Después:**
```ts
export async function respond({ messages, systemPrompt, model }) {
  return groq.chat({ messages, system: systemPrompt, model });
}
```

Net: extraer `fetchSanityContext` → función separada que cada consumidor llama si quiere.

### `packages/sanity-chatbot-schema/` (NUEVO)

```
packages/sanity-chatbot-schema/
├── src/
│   ├── schemas/
│   │   ├── chatbotConfig.ts        # Singleton type
│   │   ├── chatbotFaq.ts           # Object type (array item)
│   │   ├── chatbotBusinessInfo.ts  # Object type
│   │   └── chatbotBranding.ts      # Object type
│   ├── structure/
│   │   └── chatbotStructure.ts     # Structure Builder helper
│   └── index.ts                    # Exports
├── package.json                    # name: "@ebecerra/sanity-chatbot-schema"
└── tsconfig.json
```

Cada Sanity de cliente lo importa:

```ts
// llaullau/sanity.config.ts
import { chatbotSchemas, chatbotStructureItems } from '@ebecerra/sanity-chatbot-schema';

export default defineConfig({
  schema: { types: [...existingSchemas, ...chatbotSchemas] },
  plugins: [
    structureTool({
      structure: (S) => S.list().items([
        ...existingStructureItems,
        S.divider(),
        chatbotStructureItems(S),
      ]),
    }),
  ],
});
```

### `packages/chatbot-saas/` (NUEVO)

Lógica server-side compartida entre `apps/es` y futuras apps (operador, admin, etc.).

```
packages/chatbot-saas/
├── src/
│   ├── auth/
│   │   ├── tenant-key.ts          # validateTenantKey, hashKey, generateKey
│   │   └── api-key.ts             # V2 — vacío en V1
│   ├── config/
│   │   ├── resolver.ts            # resolveConfig(tenantId) — polimórfico por source
│   │   └── prompt-builder.ts      # buildSystemPrompt(config)
│   ├── chat/
│   │   ├── handle-chat.ts         # Orquestador: auth + quota + groq + persist
│   │   └── stream.ts              # SSE helpers
│   ├── usage/
│   │   ├── quota.ts               # checkQuota(tenantId)
│   │   └── record.ts              # recordUsage(tenantId, tokens)
│   ├── sanity-sync/
│   │   ├── webhook-handler.ts     # Procesa webhook de Sanity → upsert cache
│   │   └── verify-signature.ts
│   ├── db/
│   │   ├── client.ts              # Supabase client (service role)
│   │   ├── tenants.ts
│   │   ├── configs.ts
│   │   ├── messages.ts
│   │   ├── usage.ts
│   │   └── audit.ts
│   ├── types.ts
│   └── index.ts
└── package.json
```

### `packages/chatbot-admin-ui/` (NUEVO)

Componentes React reusables para los admin de cliente y operador.

```
packages/chatbot-admin-ui/
├── src/
│   ├── MessagesView.tsx           # Lista paginada por sesión
│   ├── UsageWidget.tsx            # Stats del mes
│   ├── SessionDetail.tsx          # Expandir conversación
│   ├── TenantStatus.tsx           # Para operador
│   └── index.ts
└── package.json
```

Cada web cliente (apps/es, llaullau, futuros) importa lo que necesite:

```tsx
// llaullau/app/admin/chatbot/mensajes/page.tsx
import { MessagesView } from '@ebecerra/chatbot-admin-ui';

export default function Page() {
  return <MessagesView
    apiUrl="/api/admin/chatbot/messages"   // proxy local
  />;
}
```

---

## Auth y autorización V1

### Tenant key (server-to-server)

Cada tenant tiene una `tenant_key` aleatoria (formato `tk_live_<32 chars random>`). Guardada como hash SHA-256 en `tenants.tenant_key_hash`, **el raw se muestra una sola vez** al crear el tenant.

Cada web cliente la mete en su env var server-side:

```env
# llaullau/.env.local
CHATBOT_API_URL=https://chats.ebecerra.es
CHATBOT_TENANT_KEY=tk_live_abcdef1234567890...
```

El componente React en el cliente NO conoce esta key. Llama a su propio API route:

```tsx
// llaullau/app/components/ChatbotEmbed.tsx
import { Chatbot } from '@ebecerra/chatbot';

export function ChatbotEmbed() {
  return <Chatbot apiUrl="/api/chatbot" />;  // ← endpoint local
}
```

```ts
// llaullau/app/api/chatbot/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const resp = await fetch(`${process.env.CHATBOT_API_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Key': process.env.CHATBOT_TENANT_KEY!,
    },
    body: JSON.stringify(body),
  });
  return new Response(resp.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

Cero exposición del key, cero CORS, cero cross-domain auth. Y el día que V2 ofrezca un widget público, este modelo sigue funcionando sin cambios — solo se añade otra ruta de auth.

### Operator auth

`ebecerra.es/admin/chatbot/*` extiende el OAuth existente ([project_admin_panel](memory:project_admin_panel)). Whitelist `app_admins` con role `admin`. JWT lleva email; API routes validan.

---

## Subdominio `chats.ebecerra.es`

**Setup**:

1. DNS en el registrar: `CNAME chats → cname.vercel-dns.com`.
2. Vercel: Settings → Domains → Add `chats.ebecerra.es` al proyecto `apps/es`.
3. Vercel auto-provisiona SSL.

**Middleware host-aware**:

```ts
// apps/es/middleware.ts
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const CHATS_ALLOWED_PREFIXES = [
  '/api/v1/',
  '/api/saas/',
];

export default function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const isChats = host.startsWith('chats.') || host === 'chats.ebecerra.es';
  const pathname = req.nextUrl.pathname;

  if (isChats) {
    const allowed = CHATS_ALLOWED_PREFIXES.some(p => pathname.startsWith(p));
    if (!allowed) {
      return new NextResponse('Not Found', { status: 404 });
    }
    // Saltarse intl para rutas API en chats
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

**Robots.txt dinámico** para evitar indexación de `chats.`:

```ts
// apps/es/app/robots.ts (Next.js Metadata Routes)
import { headers } from 'next/headers';

export default async function robots() {
  const h = await headers();
  const host = h.get('host') || '';
  if (host.startsWith('chats.')) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }],
    sitemap: 'https://ebecerra.es/sitemap.xml',
  };
}
```

**Dev**: env var `CHATBOT_API_URL=http://localhost:3000` en `.env.development.local`, en prod `https://chats.ebecerra.es`. Middleware solo aplica al detectar host `chats.*`.

---

## Flujos end-to-end

### Flujo: visitante chatea

```
[Visitante en llaullau.com]
     ↓
[Componente <Chatbot apiUrl="/api/chatbot" /> nativo]
     ↓ POST /api/chatbot
[llaullau /api/chatbot/route.ts] (server-side)
     ↓ POST https://chats.ebecerra.es/api/v1/chat
     │ X-Tenant-Key: tk_live_...
[apps/es middleware] → reconoce chats. host → permite ruta /api/v1/
[apps/es /api/v1/chat/route.ts]
     ↓ chatbotSaas.handleChat({...})
     │  - validateTenantKey() → tenant
     │  - resolveConfig(tenant.id) → cache (synced from Sanity)
     │  - checkQuota(tenant.id)
     │  - buildSystemPrompt(config)
     │  - stream from Groq
     │  - append chatbot_messages × 2 (user + assistant)
     │  - upsert chatbot_usage
     ↓ SSE stream
[Vuelve a llaullau /api/chatbot] (passthrough)
     ↓ SSE stream
[Componente React] → renderiza tokens en vivo
```

### Flujo: Laura edita FAQ

```
[Laura en llaullau.com/studio]
     ↓ edita chatbotConfig.faqs, publica
[Sanity dispara webhook chatbotConfig-published]
     ↓ POST https://chats.ebecerra.es/api/saas/sync-config
     │ Authorization: Bearer <sanity-webhook-secret>
     │ Body: documento publicado
[apps/es middleware] → permite ruta /api/saas/
[apps/es /api/saas/sync-config/route.ts]
     ↓ chatbotSaas.handleSyncWebhook(payload)
     │  - verifySignature()
     │  - resolveTenant(sanity_project_id, sanity_dataset)
     │  - upsert chatbot_configs_cache con source_revision = doc._rev
     │  - audit log
     ↓ 200 OK
[Próximo chat usa config actualizada]
```

### Flujo: Laura ve mensajes recientes

```
[Laura en llaullau.com/admin/chatbot/mensajes]
     ↓ <MessagesView apiUrl="/api/admin/chatbot/messages" />
     ↓ fetch /api/admin/chatbot/messages
[llaullau /api/admin/chatbot/messages/route.ts] (gateado por auth de llaullau)
     ↓ fetch https://chats.ebecerra.es/api/v1/messages
     │ X-Tenant-Key: tk_live_...
[apps/es /api/v1/messages/route.ts]
     ↓ db.messages.list(tenant.id, filters)
     ↓
[Vuelve paginado]
```

---

## Edición y consumo del admin

| Acción | Dónde | Cómo |
|---|---|---|
| Editar system prompt, FAQs, tono, branding | **Sanity Studio del cliente** | `chatbotConfig` singleton |
| Ver mensajes y sesiones | **Web del cliente** `/admin/chatbot/mensajes` | `<MessagesView />` reusable |
| Ver stats del mes | **Web del cliente** `/admin/chatbot` | `<UsageWidget />` reusable |
| Provisión de tenant, rotar key, archivar | **Operador en `ebecerra.es/admin/chatbot`** | Solo tú |
| Auditoría cross-tenant | **Operador en `ebecerra.es/admin/chatbot/audit`** | Solo tú |

---

## Migración del chatbot actual

El chatbot vivo desde 2026-05-13 en `apps/es`, `apps/tech`, `apps/demos` y llaullau ([project_chatbot_system](memory:project_chatbot_system)) se reorganiza así:

1. Cada uno pasa a ser un **tenant** en Supabase.
2. Su system prompt actual (que vive en su Sanity) se migra al nuevo schema `chatbotConfig` (mismo Sanity, schema nuevo).
3. El componente que renderiza el chat se sustituye por uno que llama a `chats.ebecerra.es/api/v1/chat` vía proxy local.
4. Llaullau-web ([project_chatbot_llaullau_sync](memory:project_chatbot_llaullau_sync)) deja de tener código copiado — solo el componente Chatbot, el proxy API y el env var.

---

## Lo que NO está en V1

Conscious omissions:

- ❌ Widget `<script>` para webs WordPress / no-Next.js
- ❌ Iframe embed
- ❌ Public API keys (`ck_live_*`)
- ❌ Domain allowlist por key
- ❌ CORS abierto
- ❌ Stripe Checkout / Portal / webhooks
- ❌ Onboarding wizard self-service
- ❌ Landing pública `/chatbot` con pricing
- ❌ Trial automation
- ❌ Mini-CMS para clientes sin Sanity (configs en Supabase directamente — V2)
- ❌ Free tier público
- ❌ Multi-idioma por chatbot (un idioma por tenant)
- ❌ A/B testing greetings
- ❌ Human handoff (escalado a email/WhatsApp)
- ❌ Integraciones (Zapier, Make, HubSpot)
- ❌ Semantic search sobre FAQs (de momento prompt-stuffing)

---

## Roadmap V2 — Modo SaaS público (anotado, no implementar)

Cuando aparezca demanda real (no Alejandra hipotética — Alejandra-real que dice "vale, contrato"):

| Cambio | Esfuerzo | Notas |
|---|---|---|
| Tabla `chatbot_api_keys` (`tenant_id`, `key_hash`, `allowed_domains[]`, `revoked_at`) | 0,5 día | Migración aditiva |
| Auth alternativa `X-Api-Key` en `/api/v1/chat` con domain check | 1 día | Misma función `authenticate()` |
| Loader `apps/es/public/widget/v1.js` (~3KB minified) | 1 día | Script tag con `data-key`, inyecta iframe |
| Iframe embed `apps/es/app/widget/embed/page.tsx` | 1 día | Envuelve el mismo `<Chatbot />` |
| Soporte `config_source = 'central_supabase'` en resolver | 1 día | Editor de config en `apps/es/admin/chatbot/[tenantId]` |
| Stripe products + Checkout + Portal | 2 días | 3 SKUs: basic/pro/setup |
| Webhook `/api/stripe/webhook` idempotente | 1 día | Tabla `stripe_processed_events` |
| Onboarding wizard 4 pasos | 2 días | Generación AI de FAQs iniciales |
| Landing `/chatbot` con pricing público + signup | 1 día | Singleton Sanity `chatbotProductPage` |
| Email transaccional (Resend) | 0,5 día | Bienvenida, trial-end, payment-failed |

**Total V2: ~10-11 días** de añadidos limpios sobre la base de V1.

---

## Riesgos y decisiones

| Riesgo | Mitigación |
|---|---|
| Cambios en webhook de Sanity rompen sync | Idempotencia por `_rev`, audit log de fallos, retry desde Studio (publicar de nuevo) |
| Groq free tier throttling con 4 tenants activos | Trigger upgrade a paid en cuanto un tenant pase los 30 RPM o entren datos sanitarios |
| Cold starts en Vercel free | Aceptable en V1, upgrade a Pro cuando duela |
| Streaming SSE en serverless | Probado en chatbot actual, funciona |
| LOPDGDD con mensajes de visitantes | Retención 90 días por defecto; DPA con Groq cuando entre cliente con datos sensibles |
| Middleware host-aware rompe i18n | Tests en local con hosts file + check en Vercel preview antes de prod |
| Tenant key filtrada por accidente (commit, log) | `tenant_key_hash` sin guardar raw, rotación trivial vía operator |
| Sanity schema changes rompen tenants con paquete antiguo | Versioning estricto en `@ebecerra/sanity-chatbot-schema`, additive-only changes en V1 |

---

## Decisiones cerradas

1. ✅ V1 cliente-only, V2 anotado pero no implementado
2. ✅ Multi-tenant desde día 1
3. ✅ Subdominio `chats.ebecerra.es` activo en V1 (mismo Vercel project, middleware host-aware)
4. ✅ Config en Sanity del cliente, mensajes en Supabase central, sync vía webhook
5. ✅ Edición config en Studio · histórico/stats en web admin propio
6. ✅ Auth V1: tenant key server-to-server
7. ✅ Groq free tier en V1; upgrade al primer cliente externo o sensibilidad de datos
8. ✅ Distribución de paquetes: Git URL versioned en V1, GitHub Packages cuando duela
