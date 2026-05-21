# @ebecerra/client-admin-sdk

SDK reusable para que cada web cliente añada `/admin/login` y `/admin/<tool>/*` a su dominio, proxeando al backend de `admin.ebecerra.es`. La web cliente NO toca Supabase ni Resend — solo el SDK + 3 env vars.

## Env vars

```env
ADMIN_API_URL=https://admin.ebecerra.es        # en dev: http://localhost:3000
CHATBOT_TENANT_KEY=tk_live_...                  # del PROVISIONED doc
SESSION_SECRET=<32 bytes hex>                   # generar: openssl rand -hex 32
```

## Setup mínimo en una web cliente

```ts
// app/api/auth/login/route.ts
import { buildAuthLoginHandler } from '@ebecerra/client-admin-sdk/server';
export const POST = buildAuthLoginHandler();

// app/api/auth/verify/route.ts
import { buildAuthVerifyHandler } from '@ebecerra/client-admin-sdk/server';
export const POST = buildAuthVerifyHandler();

// app/api/auth/logout/route.ts
import { buildLogoutHandler } from '@ebecerra/client-admin-sdk/server';
export const POST = buildLogoutHandler();

// app/api/admin/chatbot/sessions/route.ts
import { buildAdminProxyHandler } from '@ebecerra/client-admin-sdk/server';
export const GET = buildAdminProxyHandler('/api/admin/chatbot/sessions');

// app/admin/login/page.tsx
import { LoginForm } from '@ebecerra/client-admin-sdk/client';
export default function Page() {
  return <LoginForm tenantName="Llaullau" />;
}

// app/admin/verify/page.tsx
import { VerifyHandler } from '@ebecerra/client-admin-sdk/client';
export default function Page() { return <VerifyHandler />; }

// app/admin/chatbot/page.tsx (protegido)
import { requireSession } from '@ebecerra/client-admin-sdk/server';
import { MessagesView } from '@ebecerra/chatbot-admin-ui';

export default async function Page() {
  await requireSession({ redirectTo: '/admin/login' });
  return <MessagesView apiPath="/api/admin/chatbot" />;
}
```

## Modelo de sesión

Cookie firmada con HMAC-SHA256 usando `SESSION_SECRET`. Formato: `<payload-base64url>.<signature-base64url>` (JWT-like simplificado). Payload incluye `{ email, tenant_id, role, exp }`. Caduca a 7 días por defecto, renovable on-demand.

La cookie es `HttpOnly + Secure + SameSite=Lax`. Solo el server-side del proxy la lee.

## Endpoints upstream consumidos

- `POST {ADMIN_API_URL}/api/auth/send-magic-link` (login)
- `POST {ADMIN_API_URL}/api/auth/verify` (verify)
- `GET {ADMIN_API_URL}/api/admin/<resource>/*` (proxies)

Todos con `X-Tenant-Key: $CHATBOT_TENANT_KEY` en el header.
