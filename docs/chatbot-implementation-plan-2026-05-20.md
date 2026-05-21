# Plan de implementación — Chatbot multi-tenant V1 — 2026-05-20

**Doc de arquitectura asociado**: [chatbot-architecture-2026-05-20.md](./chatbot-architecture-2026-05-20.md)

Estimación total: **6-8 días** de trabajo (depende de tamaño de buffer y migración llaullau).

Cada fase termina en un estado **funcional y revertible**. No avanzo a la siguiente sin que la actual esté verde.

---

## Pre-requisitos (que tú haces, no yo)

Para que pueda implementar sin pedirte cada cosa por separado:

| Pre-req | Cómo | Bloqueante para fase |
|---|---|---|
| Acceso a Supabase project con permisos para crear tablas | Service role key en `apps/es/.env.local` como `SUPABASE_SERVICE_ROLE_KEY` (si no está ya) | Fase 1 |
| DNS de `chats.ebecerra.es` añadido en el registrar (CNAME → `cname.vercel-dns.com`) | Manual en DonDominio | Fase 4 |
| Custom domain `chats.ebecerra.es` añadido al proyecto Vercel `apps/es` | Manual en Vercel UI | Fase 4 |
| Sanity webhook configurado en cada workspace de cliente (V1: solo apps/es) | Sanity Manage UI, apunta a `https://chats.ebecerra.es/api/saas/sync-config` | Fase 2 (apps/es) / Fase 7 (llaullau) |
| `SANITY_WEBHOOK_SECRET` env var compartido | Vercel env vars de `apps/es` | Fase 2 |
| Groq API key (`GROQ_API_KEY`) — ya existe en Vercel ([reference_vercel_env_vars](memory:reference_vercel_env_vars)) | Verificar que sigue activa | Fase 3 |

Si alguno bloquea, paro y te aviso.

---

## Fase 1 — Foundation (Día 1)

**Estado final**: schema Supabase aplicado, paquetes nuevos scaffold (sin lógica todavía), motor refactorizado.

### Tareas

1. **Migración Supabase**: crear `apps/es/supabase/migrations/<timestamp>_chatbot_saas.sql` con todas las tablas (`tenants`, `chatbot_configs_cache`, `chatbot_messages`, `chatbot_usage`, `chatbot_audit_log`) + RLS policies.
2. **Aplicar migración** vía `mcp__supabase__apply_migration` (o, si prefieres, generar el SQL y aplicarlo tú vía Supabase CLI). Default: lo aplico yo.
3. **Scaffold `packages/sanity-chatbot-schema/`** — package.json + tsconfig + src/index.ts vacío + carpetas.
4. **Scaffold `packages/chatbot-saas/`** — package.json + tsconfig + src/index.ts vacío + carpetas según diagrama de arquitectura.
5. **Scaffold `packages/chatbot-admin-ui/`** — package.json + tsconfig + src/index.ts vacío.
6. **Refactor `packages/chatbot/`** — extraer `fetchSanityContext` a función separada, hacer que `respond()` acepte `systemPrompt` y `model` como params. Mantener backward-compat con un wrapper `respondWithSanity()` para no romper las 3 apps actuales.
7. **`npm install`** en root del monorepo para linkear los workspaces nuevos.
8. **Smoke test**: ejecutar `respond({ messages, systemPrompt: 'Eres un test', model: 'llama-3.1-70b-versatile' })` desde un script y verificar que Groq responde.

### Definition of done

- [ ] Migración aplicada, tablas visibles en Supabase con `mcp__supabase__list_tables`
- [ ] Los 3 paquetes nuevos resuelven import `import {} from '@ebecerra/...'` sin error TS
- [ ] El motor refactorizado responde con un prompt arbitrario (smoke test)
- [ ] Tests existentes de `packages/chatbot/` siguen pasando si los hay
- [ ] `npm run typecheck` limpio en el monorepo

---

## Fase 2 — Sanity integration (Día 1-2)

**Estado final**: `@ebecerra/sanity-chatbot-schema` con tipos completos, `apps/es` lo consume y muestra "Chatbot" en Studio, webhook receiver funcional.

### Tareas

1. **Schemas en `packages/sanity-chatbot-schema/src/schemas/`**:
   - `chatbotConfig.ts` (singleton) con todos los campos del diagrama
   - `chatbotFaq.ts` (object para array item)
   - `chatbotBusinessInfo.ts` (object embebido)
   - `chatbotBranding.ts` (object embebido)
   - Bilingüe (localeString/localeText) per [CLAUDE.md regla 4](../CLAUDE.md)
2. **Structure helper** `chatbotStructureItems(S)` → devuelve items para Structure Builder.
3. **Integrar en `apps/es/sanity.config.ts`** — añadir schemas + structure items.
4. **Deploy schema** vía `npx sanity schema deploy --workspace ebecerra-web` desde apps/es (per [feedback_sanity_mcp_gotchas](memory:feedback_sanity_mcp_gotchas)).
5. **Crear singleton inicial** en Studio: documento `chatbotConfig` con prompt actual de apps/es como punto de partida (migrado a mano o vía MCP patch).
6. **Webhook receiver** en `packages/chatbot-saas/src/sanity-sync/webhook-handler.ts`:
   - Verifica HMAC signature con `SANITY_WEBHOOK_SECRET`
   - Resuelve `tenant_id` por `sanity_project_id + sanity_dataset`
   - Upsert en `chatbot_configs_cache` (mapea schema Sanity → columnas Supabase)
   - Idempotencia por `source_revision = doc._rev`
   - Audit log entry
7. **API route** `apps/es/app/api/saas/sync-config/route.ts` → llama handler del paquete.
8. **Configurar webhook en Sanity** (apps/es workspace): URL `https://chats.ebecerra.es/api/saas/sync-config` (en V1 todavía sin subdominio activo → `https://ebecerra.es/api/saas/sync-config`, cambiar en Fase 4).

### Definition of done

- [ ] En Studio de apps/es aparece "Chatbot" en el side panel
- [ ] Editar y publicar el singleton refleja la fila en `chatbot_configs_cache`
- [ ] Re-publicar sin cambios no duplica filas (idempotencia)
- [ ] `mcp__sanity__get_schema` muestra los nuevos types

---

## Fase 3 — Core API (Día 2-3)

**Estado final**: `/api/v1/chat` funcional con streaming Groq, autenticación, quota tracking, persistencia de mensajes y audit.

### Tareas

1. **Auth module** `packages/chatbot-saas/src/auth/tenant-key.ts`:
   - `generateTenantKey()` → devuelve raw + hash + prefix
   - `validateTenantKey(rawKey)` → busca por hash, devuelve tenant o null
   - `rotateTenantKey(tenantId)`
2. **Config resolver** `packages/chatbot-saas/src/config/resolver.ts`:
   - `resolveConfig(tenantId)` → lee `chatbot_configs_cache`. Polimórfico por `config_source` (V1 solo soporta `sanity_proxy`; lanza error claro para los otros).
   - `buildSystemPrompt(config)` → construye prompt final con business_info + faqs + tone.
3. **Quota & usage** `packages/chatbot-saas/src/usage/`:
   - `checkQuota(tenantId)` → lee `chatbot_usage` del mes; si excede `monthly_message_limit`, devuelve `{ ok: false, retryAt }`.
   - `recordUsage(tenantId, tokens)` → upsert.
4. **Chat orchestrator** `packages/chatbot-saas/src/chat/handle-chat.ts`:
   - validateTenantKey
   - resolveConfig
   - checkQuota
   - llama `respond()` de `packages/chatbot/` con streaming
   - persiste mensajes user + assistant en chatbot_messages
   - recordUsage
   - audit log opcional
5. **API route** `apps/es/app/api/v1/chat/route.ts`:
   - Method POST
   - Lee `X-Tenant-Key`, sessionId, messages del body
   - Llama handler
   - Devuelve SSE stream
6. **API route** `apps/es/app/api/v1/config/route.ts`:
   - Method GET
   - Devuelve config "pública" del tenant (greeting, branding only) — útil para componentes que quieren skeleton antes de chat
7. **API route** `apps/es/app/api/v1/messages/route.ts`:
   - Method GET
   - Lee tenant key, filtros, paginación
   - Devuelve mensajes del tenant

### Definition of done

- [ ] Curl con `X-Tenant-Key` válida + body correcto recibe stream SSE de Groq
- [ ] Curl sin key o con key inválida devuelve 401
- [ ] Curl excediendo quota mensual devuelve 429
- [ ] Después de un chat, hay 2 filas en `chatbot_messages` y `chatbot_usage` se incrementa
- [ ] `GET /api/v1/messages` devuelve los mensajes del tenant correcto

---

## Fase 4 — Subdomain chats.ebecerra.es (Día 3)

**Estado final**: `chats.ebecerra.es` activo, middleware bloquea rutas que no son API, robots.txt aislado por host.

### Tareas

1. **Verificar pre-reqs**: DNS CNAME + Vercel custom domain configurados (tú).
2. **Middleware host-aware** `apps/es/middleware.ts`:
   - Detectar `host.startsWith('chats.')`
   - Permitir solo `/api/v1/` y `/api/saas/`
   - 404 para todo lo demás
   - Saltarse intl middleware en chats host
3. **Robots dinámico** `apps/es/app/robots.ts`:
   - Si host es chats → `Disallow: /`
   - Si no → robots normal de ebecerra.es
4. **Actualizar Sanity webhook URL** a `https://chats.ebecerra.es/api/saas/sync-config`
5. **Test**: curl `https://chats.ebecerra.es/api/v1/chat` debe funcionar, `https://chats.ebecerra.es/blog` debe 404.

### Definition of done

- [ ] `https://chats.ebecerra.es/api/v1/chat` responde (POST con tenant key)
- [ ] `https://chats.ebecerra.es/blog` devuelve 404
- [ ] `https://chats.ebecerra.es/robots.txt` devuelve `Disallow: /`
- [ ] `https://ebecerra.es/robots.txt` no cambia (sigue allowing salvo /api/ /admin/)
- [ ] Las rutas i18n de ebecerra.es siguen funcionando (no rompemos next-intl)

---

## Fase 5 — Migrar tenants internos (Día 4)

**Estado final**: apps/es, apps/tech, apps/demos consumen el nuevo API en lugar del chatbot embebido directo. Su chatbot funciona igual o mejor que antes.

### Tareas

1. **Provisión de tenants** vía operator panel (Fase 6 lo hace bonito, en F5 lo hago directo en Supabase con MCP):
   - tenant `apps-es` con `sanity_project_id=gdtxcn4l`, `sanity_dataset=production`, `sanity_workspace=ebecerra-web`
   - tenant `apps-tech` (mismo project, ¿mismo dataset?, mismo workspace?) — revisar primero
   - tenant `apps-demos` (idem)
   - Generar tenant keys, guardar raw temporalmente para configurar env vars
2. **Env vars** en cada app:
   - `CHATBOT_API_URL=https://chats.ebecerra.es`
   - `CHATBOT_TENANT_KEY=tk_live_...`
3. **Migrar el componente Chatbot existente en cada app**:
   - Quitar dependencia directa de Sanity context fetcher
   - Usar el nuevo motor refactorizado pasándole config resuelta vía API
   - O más simple: el componente solo necesita `apiUrl` local (`/api/chatbot`), y cada app tiene su `/api/chatbot/route.ts` proxy
4. **Crear `/api/chatbot/route.ts`** en cada app (apps/es, apps/tech, apps/demos):
   - Lee body, añade `X-Tenant-Key`, proxea a `chats.ebecerra.es/api/v1/chat`
   - Pasa el SSE stream
5. **Migrar los datos de Sanity** — en V1 los 3 workspaces ya tienen chatbot config disperso; consolidar en el nuevo `chatbotConfig` singleton por workspace.
6. **Smoke test en cada app**: abrir el chatbot, mandar mensaje, verificar respuesta + persistencia en Supabase con tenant correcto.

### Definition of done

- [ ] apps/es: chatbot responde tirando del nuevo backend, tenant_id correcto en chatbot_messages
- [ ] apps/tech: idem
- [ ] apps/demos: idem
- [ ] Editar el `chatbotConfig` en Studio refleja cambios en respuestas (vía webhook)
- [ ] Cero regresiones visibles para visitantes

---

## Fase 6 — Admin UI (Día 5)

**Estado final**: operator panel en `apps/es/admin/chatbot` lista tenants y muestra mensajes. Componente `<MessagesView />` reusable disponible para apps de clientes.

### Tareas

1. **Operator panel** `apps/es/app/admin/chatbot/`:
   - `/admin/chatbot/page.tsx` — lista de tenants con status, último mensaje, usage del mes
   - `/admin/chatbot/[tenantId]/page.tsx` — detalle del tenant
   - `/admin/chatbot/[tenantId]/mensajes/page.tsx` — viewer de mensajes con filtro por sesión
   - `/admin/chatbot/[tenantId]/configuracion/page.tsx` — solo si `config_source = 'central_supabase'` (V2), en V1 muestra enlace al Sanity Studio del cliente
   - `/admin/chatbot/nuevo/page.tsx` — form para provisionar tenant nuevo
2. **API routes admin** `apps/es/app/api/admin/chatbot/`:
   - `GET /tenants` — lista
   - `POST /tenants` — crear (devuelve raw key 1 vez)
   - `PATCH /tenants/[id]`
   - `POST /tenants/[id]/rotate-key`
   - `GET /messages?tenantId=&from=&limit=` — global cross-tenant
3. **Auth**: gateado por `app_admins.role = 'admin'` (whitelist existente).
4. **Componentes reusables** en `packages/chatbot-admin-ui/`:
   - `<MessagesView apiUrl="/api/admin/chatbot/messages" />` — paginado, filtro por sesión, expand
   - `<UsageWidget apiUrl="/api/admin/chatbot/usage" />`
   - `<SessionDetail sessionId={...} />`
5. **Wire en apps/es para tu propio tenant** (dogfood):
   - `apps/es/app/admin/chatbot/me/page.tsx` — Enrique como cliente, ve sus propios mensajes
   - `apps/es/app/api/admin/chatbot/me/messages/route.ts` — proxy con tenant key de apps-es

### Definition of done

- [ ] `/admin/chatbot` lista los 3 tenants internos
- [ ] Click en uno muestra sus mensajes con paginación
- [ ] Provisionar tenant nuevo funciona, devuelve key una vez
- [ ] Rotar key invalida la anterior, válida la nueva
- [ ] `<MessagesView />` se importa y funciona desde apps/es/admin

---

## Fase 7 — Migrar llaullau (Día 6)

**Estado final**: llaullau-web es tenant externo en el sistema, edita config en su Sanity, ve mensajes en `llaullau.com/admin/chatbot`. Cero código del motor copiado.

### Tareas

> Esta fase toca el repo **llaullau-web** (separado). Lo haré con permisos similares a este repo.

1. **Provisionar tenant `llaullau`** desde operator panel:
   - `sanity_project_id` = el de llaullau (consultar)
   - Generar tenant key
2. **Añadir paquetes** en llaullau-web (vía Git URL con tag o copy-paste según [project_chatbot_llaullau_sync](memory:project_chatbot_llaullau_sync)):
   - `@ebecerra/sanity-chatbot-schema`
   - `@ebecerra/chatbot` (refactorizado)
   - `@ebecerra/chatbot-admin-ui`
3. **Integrar schema** en `llaullau/sanity.config.ts`
4. **Deploy schema** Sanity de llaullau
5. **Migrar system prompt actual** de llaullau a singleton `chatbotConfig`
6. **Env vars** en Vercel de llaullau:
   - `CHATBOT_API_URL`, `CHATBOT_TENANT_KEY`
7. **Sustituir componente Chatbot actual** por el nuevo + `/api/chatbot` proxy
8. **Configurar webhook Sanity** del workspace de llaullau apuntando a `chats.ebecerra.es/api/saas/sync-config`
9. **Admin section** en llaullau:
   - `llaullau/app/admin/chatbot/mensajes/page.tsx` con `<MessagesView />`
   - `llaullau/app/api/admin/chatbot/messages/route.ts` proxy
   - Auth: la que llaullau ya tenga
10. **Smoke test end-to-end**: chatear, ver mensajes, editar FAQ en Studio, verificar respuesta actualizada.

### Definition of done

- [ ] Llaullau chatbot funciona vía nuevo backend
- [ ] Editar FAQ en Studio de llaullau refleja en próximo chat
- [ ] Laura puede ver mensajes en `llaullau.com/admin/chatbot/mensajes`
- [ ] Cero código del motor copy-pasted entre repos

---

## Fase 8 — Polish (Día 7-8, buffer)

**Estado final**: edge cases manejados, errores con mensajes claros, doc interna para "cómo añadir un tenant nuevo", buffer absorbido.

### Tareas

1. **Error handling**:
   - 401 con mensaje claro si tenant key inválida
   - 429 con `Retry-After` header si quota excedida
   - 503 si Groq down (con fallback a "no estoy disponible ahora")
   - Timeout client-side en componente si server tarda > 30s
2. **Sentry o logging estructurado** — opt-in si quieres, default skip en V1
3. **Doc interna** `docs/chatbot-onboard-new-tenant.md` — guía paso a paso para añadir un cliente nuevo (provisión + env vars + Sanity schema deploy + webhook)
4. **Edge cases**:
   - Mensaje > 2000 chars → reject 413
   - Sesión sin mensajes previos → OK (primer turno)
   - Sanity webhook con doc no-chatbot → ignore (no error)
   - Tenant archived → 410 Gone con mensaje
5. **Performance check**:
   - Latencia p50/p95 del endpoint en 4 tenants simultáneos
   - Considerar `chatbot_configs_cache` con índices
6. **Memoria actualizada**:
   - Actualizar [project_chatbot_system](memory:project_chatbot_system) reflejando arquitectura nueva
   - Actualizar [project_chatbot_llaullau_sync](memory:project_chatbot_llaullau_sync) — copy-paste muere, ahora es tenant gestionado

### Definition of done

- [ ] Todos los edge cases tienen response codes y mensajes razonables
- [ ] `docs/chatbot-onboard-new-tenant.md` es completo y reproducible
- [ ] Memorias relevantes actualizadas
- [ ] Smoke test end-to-end en los 4 tenants pasa

---

## Cómo me organizo turnando contigo

Lo dejo libre por defecto: tiro fase a fase, te aviso al final de cada una con un resumen corto (qué pasó, qué tocó, qué falta). Si en algún momento prefieres que pare antes de una fase concreta (típicamente Fase 4 que toca DNS, o Fase 7 que toca otro repo), me lo dices y paro.

Si un pre-requisito tuyo bloquea, paro y te aviso.

---

## Riesgos del plan en sí (no de la arquitectura)

| Riesgo | Mitigación |
|---|---|
| Sanity schema deploy bloqueado por permisos | Skill [project_sanity_write_token](memory:project_sanity_write_token) tiene el flujo, replicar |
| Migración Supabase rompe alguna tabla existente | Migración es solo aditiva (CREATE TABLE, no ALTER) — bajo riesgo |
| Vercel build falla por workspace nuevo no resuelto | [feedback_vercel_deps](memory:feedback_vercel_deps) — verificar lock file antes de pushear |
| Refactor motor rompe chatbot vivo en apps/es/tech/demos | Mantener wrapper `respondWithSanity()` para backward compat hasta Fase 5 |
| Middleware host-aware rompe i18n existente | Test exhaustivo en Vercel preview antes de prod |
| Tenant key filtrada en commit accidental | Solo hash en DB, raw en env vars (nunca en código) |
| `chats.ebecerra.es` indexado por Google antes de robots | Robots dinámico desde día 1 (Fase 4) |

---

## Lo que NO está en este plan

Para ser explícito sobre scope:

- ❌ Cualquier cosa de V2 (Stripe, widget script, public API keys, onboarding, etc.)
- ❌ Tests automatizados de chatbot — V1 no tiene CI testing del chatbot. Smoke tests manuales.
- ❌ Optimización avanzada (edge runtime, multi-region, etc.)
- ❌ Internacionalización del admin UI más allá de español
- ❌ Dark mode, accesibilidad WCAG completa en admin — UI funcional, no producción ready de design

Todo eso queda para iteraciones posteriores cuando V1 esté en producción.
