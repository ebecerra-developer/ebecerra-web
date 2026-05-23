# Plan de implementación — Sistema de reservas multi-tenant — 2026-05-22

Estimación total: **5–7 días** para Fase 1 (sistema propio nativo, listo para piloto con Alejandra/BeeMovement). Fase 2 (adapters externos) bajo demanda.

Cada fase termina en un estado **funcional y revertible**. No avanzo a la siguiente sin que la actual esté verde.

---

## Decisiones tomadas (del briefing con Enrique)

| Decisión | Resolución | Por qué |
|---|---|---|
| Single-resource vs multi-recurso | **Single en V1** (un calendario por negocio). Multi a futuro cuando aparezca el cliente (peluquería, clínica). | 30% del trabajo, cubre el 80% de los casos PYME/autónomo. |
| Auto-confirma vs aprobación manual | **Auto por defecto, flag `requires_approval` en `booking_tenants` para casos específicos.** | Estándar moderno (Calendly). Manual disponible si el cliente lo pide. |
| Multi-tenant | **Sí desde el día 1.** | Patrón ya calcado del chatbot SaaS, cero coste añadido. |
| Backend público | **Subdominio `bookings.ebecerra.es`** paralelo a `chats.ebecerra.es`. | CORS limpio, métricas separadas, mismo mental model. |
| Acceso por servicio | **`BOOKING_TENANT_KEY` propia, independiente de `CHATBOT_TENANT_KEY`.** | Cliente paga solo lo que usa; revocación = borrar fila. |
| Gestión y configuración | **Dentro del `/admin` existente**, nueva pestaña Reservas. | Reutiliza magic link auth, whitelist `app_admins`, layout. |
| Permisos por persona | **`app_admins.permissions: { chatbot: bool, bookings: bool }`** (jsonb). Nav del admin oculta pestañas según flag. | Granular, escalable a futuros módulos. |
| Provider abstraction | **Sí desde el día 1**, aunque V1 solo tenga adapter `native`. | Fase 2 = añadir adapters sin tocar frontend. |
| Confirmar/cancelar | **Magic link por email**, primitivo `magic_link_tokens` ya existe del admin — extender o paralelo. | Sin cuenta de usuario para el visitante final. |
| Sync calendario externo del negocio | **Google Calendar one-way en Fase 1.5** (no bloquea piloto). Outlook/iCloud a futuro. | Mayoría de PYMEs usan Google Workspace. |

---

## Pre-requisitos (que haces tú, no yo)

| Pre-req | Cómo | Bloqueante para fase |
|---|---|---|
| DNS de `bookings.ebecerra.es` añadido en el registrar (CNAME → `cname.vercel-dns.com`) | Manual en DonDominio | Fase 7 |
| Custom domain `bookings.ebecerra.es` añadido al proyecto Vercel `apps/es` | Manual en Vercel UI | Fase 7 |
| Env var `BOOKINGS_WEBHOOK_SECRET` en Vercel de `apps/es` | Vercel env vars | Fase 2 |
| Env var `BOOKINGS_TOKEN_SECRET` (HMAC para confirm/cancel tokens) | Vercel env vars | Fase 3 |
| Resend API key — **ya existe** en `apps/es` | Verificar que sigue activa | Fase 4 |
| Supabase service role key — **ya existe** como `SUPABASE_SERVICE_ROLE_KEY` | Verificar | Fase 1 |
| Sanity write token `claude-mcp-write` — **ya existe** como `SANITY_API_TOKEN` en `apps/es/.env.local` ([project_sanity_write_token](memory:project_sanity_write_token)) | Verificar | Fase 2 |
| (Opcional, Fase 1.5) Google Cloud OAuth client para Calendar API | Manual en Google Cloud Console | Fase 8 |

Si alguno bloquea, paro y aviso.

---

## Arquitectura

### Infraestructura reutilizada

- **`tenants`** (Supabase): tabla compartida con chatbot. Reservas añade fila `booking_tenants` con FK a `tenants.id`.
- **`app_admins`**: extender con columna `permissions jsonb`. El layout del `/admin` lee este flag para mostrar/ocultar la pestaña Reservas.
- **`magic_link_tokens`** (Supabase): mismo patrón conceptual para tokens de confirm/cancel del visitante. Como el scope es distinto (no es login admin), creo tabla paralela **`booking_tokens`** para no contaminar la del admin.
- **Resend**: emails transaccionales (pendiente, confirmada con .ics, recordatorio 24h, cancelada).
- **Sanity webhook proxy** en `apps/es/api/revalidate`: añadir caso `_type == "bookingConfig" | "bookingService"` que reenvía a `bookings.ebecerra.es/api/saas/sync-config`.
- **`/admin` shell**: AdminShell, layout, magic link auth — todo se reutiliza.

### Paquetes nuevos

| Paquete | Contenido |
|---|---|
| `@ebecerra/sanity-booking-schema` | Schemas Sanity: `bookingConfig`, `bookingService`, `weeklySchedule`, `availabilityOverride`. Structure helper. Bilingüe. |
| `@ebecerra/bookings` | Engine: provider abstraction (`BookingProvider`), adapter `native`, lock optimista, slot math, token primitives, email templates. Server-side. |
| `@ebecerra/bookings-admin-ui` | React components cliente para `/admin/bookings`: tabla, filtros, calendario semanal de configuración. |

`BookingFlow` (widget público) vive en `@ebecerra/bookings/widget` como sub-export — un solo componente, no hace falta paquete dedicado.

### Subdominio y endpoints

`bookings.ebecerra.es` apunta al mismo deploy de `apps/es` (alias en Vercel). Las rutas críticas:

- `POST /api/v1/bookings/availability` — devuelve slots libres para `{tenant, serviceId, dateRange}`.
- `POST /api/v1/bookings/create` — crea booking en estado `pending`, manda email con tokens.
- `GET  /api/v1/bookings/confirm?token=…` — valida + marca `confirmed`, devuelve HTML de confirmación.
- `GET  /api/v1/bookings/cancel?token=…` — valida + marca `cancelled`.
- `POST /api/saas/sync-config` — webhook receiver de Sanity (proxy desde apps/es/api/revalidate).

Las páginas de gestión están en `/admin/bookings` del dominio que use cada cliente (apps/es → `ebecerra.es/admin/bookings`, llaullau → `llaullau.com/admin/bookings`).

### Magic link tokens del visitante

Patrón:
1. Al crear booking, generamos **2 tokens raw** (uno scope `confirm`, otro `cancel`), guardamos sus `token_hash` en `booking_tokens` con `expires_at = booking_slot + 1 día`.
2. El email lleva los raw como query params (`?token=raw`).
3. Endpoint hashea el raw, busca, valida scope + no `used_at` + no expirado, ejecuta la acción, marca `used_at`.
4. Confirm consume el token de confirm; cancel se puede usar hasta el momento de la cita.

HMAC firma adicional sobre el raw con `BOOKINGS_TOKEN_SECRET` para que un token robado de DB no sea útil sin la secret.

---

## Fase 1 — Foundation (Día 1)

**Estado final**: schema Supabase aplicado, paquetes nuevos scaffold (sin lógica todavía), permissions flag en `app_admins`.

### Tareas

1. **Migración Supabase** `apps/es/supabase/migrations/<timestamp>_bookings_foundation.sql`:
   - `booking_tenants` (id, tenant_id FK, slug, timezone, currency, default_locale, requires_approval bool, cancellation_policy text, contact_email, created_at)
   - `booking_services` (id, booking_tenant_id, name jsonb (es/en), description jsonb, duration_min, buffer_before_min, buffer_after_min, price_cents, currency, color, active, sort_order)
   - `booking_weekly_schedules` (id, booking_tenant_id, weekday 0-6, start_time, end_time)
   - `booking_availability_overrides` (id, booking_tenant_id, date, kind: closed|extra, start_time?, end_time?, reason)
   - `bookings` (id, booking_tenant_id, service_id, slot_start_utc, slot_end_utc, status enum, contact_name, contact_email, contact_phone, notes, locale, created_at, confirmed_at, cancelled_at, cancelled_by enum: customer|business|expired|noshow, ical_uid)
   - `booking_tokens` (id, token_hash, booking_id FK, scope: confirm|cancel, created_at, expires_at, used_at)
   - `booking_audit_log` (id, booking_id, event, actor, payload jsonb, created_at)
   - RLS: service_role only en V1; operator/client read según `app_admins.tenant_id` + `permissions->>bookings`.
   - Índices: `(booking_tenant_id, slot_start_utc)`, `(token_hash)`, `(booking_id, scope)`.
2. **Extender `app_admins`**: añadir columna `permissions jsonb default '{}'::jsonb`. Backfill: todos los rows existentes con `{"chatbot": true}` (operator) o `{"chatbot": true}` (client del chatbot). Reservas se activa explícitamente por cliente.
3. **Scaffold `packages/sanity-booking-schema/`** — package.json + tsconfig + src/index.ts.
4. **Scaffold `packages/bookings/`** — package.json + tsconfig + src/index.ts + carpetas `adapters/`, `tokens/`, `email/`, `slots/`, `widget/`.
5. **Scaffold `packages/bookings-admin-ui/`** — package.json + tsconfig + src/index.ts.
6. **`npm install`** en root para linkear workspaces.

### Definition of done

- [ ] Migración aplicada, tablas visibles en Supabase con `mcp__supabase__list_tables`
- [ ] `app_admins.permissions` con backfill correcto (las 3 filas operator + las que haya client)
- [ ] Los 3 paquetes nuevos resuelven imports `@ebecerra/...` sin error TS
- [ ] `npm run typecheck` limpio

---

## Fase 2 — Sanity integration (Día 1–2)

**Estado final**: `@ebecerra/sanity-booking-schema` con tipos, Studio de `apps/es` muestra "Reservas" en side panel, webhook receiver funcional sincroniza Sanity → Supabase.

### Tareas

1. **Schemas en `packages/sanity-booking-schema/src/schemas/`**:
   - `bookingConfig.ts` (singleton): timezone, currency, default_locale, requires_approval bool, cancellation_policy text bilingüe, contact_email, email_templates (override de pendiente/confirmada/recordatorio/cancelada).
   - `bookingService.ts` (document): name localeString, description localeText, duration_min, buffer_*, price_cents, color, active, sort_order.
   - `weeklySchedule.ts` (object array dentro de bookingConfig): weekday + start + end. Permite varios tramos por día (mañana+tarde).
   - `availabilityOverride.ts` (object array): fecha + kind + tramo + razón.
   - Bilingüe ES+EN per [CLAUDE.md regla 4](../CLAUDE.md).
2. **Structure helper** `bookingStructureItems(S)` → "Reservas" con singleton + lista de servicios.
3. **Integrar en `apps/es/sanity.config.ts`** — añadir schemas + structure items. Deploy con `npx sanity schema deploy --workspace ebecerra-web` ([feedback_sanity_mcp_gotchas](memory:feedback_sanity_mcp_gotchas)).
4. **Webhook receiver** `packages/bookings/src/sanity-sync/webhook-handler.ts`:
   - Verifica HMAC con `BOOKINGS_WEBHOOK_SECRET`.
   - Resuelve `booking_tenant_id` por `sanity_project_id + sanity_dataset` (mismo patrón que chatbot).
   - Mapea schema Sanity → tablas Supabase (`booking_tenants`, `booking_services`, `booking_weekly_schedules`, `booking_availability_overrides`).
   - Idempotencia por `_rev`.
   - Audit log entry.
5. **API route** `apps/es/app/api/saas/bookings-sync/route.ts` → llama handler del paquete.
6. **Extender proxy de revalidate** en `apps/es/app/api/revalidate/route.ts` para reenviar también `_type` de reservas al endpoint anterior (todavía mismo dominio en Fase 2; cambia a `bookings.ebecerra.es` en Fase 7).
7. **Configurar webhook en Sanity** workspace `ebecerra-web` apuntando al endpoint (todavía `ebecerra.es/api/saas/bookings-sync` en V1).
8. **Crear contenido inicial** para piloto: singleton `bookingConfig` (timezone Europe/Madrid, EUR, locale es) + 2-3 servicios de prueba. Vía MCP Sanity ([sanity-content-flow](memory:project_sanity_write_token)).

### Definition of done

- [ ] En Studio de `apps/es` aparece "Reservas" con singleton + lista de servicios
- [ ] Editar y publicar refleja la fila en `booking_tenants`/`booking_services`
- [ ] Re-publicar sin cambios no duplica filas (idempotencia)
- [ ] `mcp__sanity__get_schema` muestra los nuevos types

---

## Fase 3 — Provider abstraction + native adapter (Día 2–3)

**Estado final**: lógica de disponibilidad y creación de reservas funciona server-side. Sin frontend todavía. Testeable con curl.

### Tareas

1. **Interface `BookingProvider`** `packages/bookings/src/adapters/types.ts`:
   ```ts
   interface BookingProvider {
     getAvailability(params: { serviceId: string; from: Date; to: Date; tz: string }): Promise<Slot[]>;
     createBooking(params: CreateBookingParams): Promise<{ bookingId: string; confirmToken: string; cancelToken: string }>;
     confirmBooking(token: string): Promise<{ booking: Booking }>;
     cancelBooking(token: string, by: 'customer' | 'business'): Promise<{ booking: Booking }>;
   }
   ```
2. **Adapter `native`** `packages/bookings/src/adapters/native/`:
   - `availability.ts`: dado un `booking_tenant_id` + service + rango, calcula slots a partir de `weekly_schedules` + `availability_overrides`, resta `bookings` existentes en estado `pending` o `confirmed`, aplica buffers. Resuelve en UTC, devuelve con offset del tenant.
   - `create.ts`: transacción Supabase con lock optimista (re-check de disponibilidad dentro de la transacción) + insert booking + insert 2 tokens. Devuelve raw tokens (la única vez que existen sin hashear).
   - `confirm.ts`: valida token (hash + scope + expiración + not used), update booking a `confirmed`, marca token usado, audit log.
   - `cancel.ts`: idem, update a `cancelled` con `cancelled_by`.
3. **Token utilities** `packages/bookings/src/tokens/`:
   - `generate()` → raw + hash (SHA-256) + HMAC con `BOOKINGS_TOKEN_SECRET`.
   - `validate(raw, expectedScope)` → busca por hash, verifica HMAC, devuelve `{ ok, booking_id }`.
4. **Auth tenant key** `packages/bookings/src/auth/tenant-key.ts`:
   - Igual que chatbot: `generateTenantKey()`, `validateTenantKey(rawKey)`. Tabla `booking_tenants.api_key_hash` + `api_key_prefix` añadida en la migración de Fase 1 (corrijo y añado en esa migración).
5. **API routes** en `apps/es/app/api/v1/bookings/`:
   - `availability/route.ts` (POST) — lee `X-Tenant-Key`, llama provider, devuelve slots.
   - `create/route.ts` (POST) — valida body, llama provider, dispara emails (Fase 4), devuelve `{ bookingId, slot }` sin tokens.
   - `confirm/route.ts` (GET) — landing HTML directo (no JSON), valida y muestra "Cita confirmada" con datos.
   - `cancel/route.ts` (GET) — landing HTML, muestra "Cita cancelada".
6. **Tests manuales**:
   - Curl availability para esta semana, ver slots.
   - Curl create con un slot, ver booking pending + tokens.
   - GET confirm con el token raw, ver booking confirmed.
   - GET cancel con el token raw, ver booking cancelled.

### Definition of done

- [ ] Curl availability con tenant key válida devuelve slots realistas (respeta weekly + overrides + buffers)
- [ ] Curl create devuelve 200 y aparece fila pending + 2 tokens en `booking_tokens`
- [ ] GET confirm con token válido marca confirmed; repetir devuelve 410 (token usado)
- [ ] GET cancel idem
- [ ] Intento de doble booking sobre el mismo slot devuelve 409 (race condition)

---

## Fase 4 — Emails con Resend (Día 3)

**Estado final**: cada transición de estado dispara su email. Plantillas overridables desde Sanity.

### Tareas

1. **Plantillas React Email** en `packages/bookings/src/email/templates/`:
   - `BookingPending` — datos cita + link confirmar + link cancelar
   - `BookingConfirmed` — datos + .ics attachment
   - `BookingReminder24h` — recordatorio + link cancelar
   - `BookingCancelled` — confirmación de cancelación
   - Branding mínimo (logo del negocio si está en `booking_tenants.branding_logo_url`, color primario).
   - Bilingüe — render según `booking.locale`.
2. **`.ics` generator** `packages/bookings/src/email/ics.ts` — RFC 5545 mínimo (VEVENT con UID = `bookings.ebecerra.es+<booking_id>`).
3. **Send helpers** `packages/bookings/src/email/send.ts` — wrappers sobre Resend con plantilla + locale + overrides desde Sanity.
4. **Integrar en provider native** — hooks `onCreate → sendPending`, `onConfirm → sendConfirmed`, `onCancel → sendCancelled`.
5. **Cron Vercel** para recordatorios: `apps/es/app/api/cron/booking-reminders/route.ts` → busca confirmed entre 23h y 25h, envía `BookingReminder24h`, marca flag `reminder_sent_at`. Schedule en `vercel.json`: `0 8 * * *` (8am UTC) o más fino. Añadir columna `reminder_sent_at` a `bookings` en la migración inicial.

### Definition of done

- [ ] Crear booking dispara email pending al contact_email con 2 links válidos
- [ ] Confirmar dispara email confirmed con .ics que importa OK en Google Calendar / Outlook / iCloud
- [ ] Cancelar dispara email cancelled
- [ ] Cron manual (curl al endpoint) envía recordatorios solo para citas en 24h ± margen
- [ ] Plantilla con override en Sanity respeta el copy custom

---

## Fase 5 — Widget público `<BookingFlow />` (Día 3–4)

**Estado final**: componente React embebible con 4 pasos. Mobile-first. Sin estilos inventados — tokens del tenant.

### Tareas

1. **`packages/bookings/src/widget/BookingFlow.tsx`** — componente cliente, props `{ tenantKey, locale, apiBase, brandingTokens? }`.
2. **4 pasos como sub-componentes**:
   - `Step1ServicePicker` — lee `GET /api/v1/bookings/services?tenant=…` (nuevo endpoint público de catálogo), renderiza tarjetas.
   - `Step2Calendar` — calendario mensual mobile-first, fetch availability del mes actual al cambiar de mes. Highlight días con slots disponibles.
   - `Step3SlotPicker` — slots del día seleccionado, lista vertical, agrupado por mañana/tarde.
   - `Step4ContactForm` — name, email, phone, notas opcionales. Validación cliente + server.
3. **State machine** simple con `useReducer`. Cada paso desbloquea el siguiente. Botón "atrás" en cada paso.
4. **Confirmación in-app** tras `POST /create`: pantalla "Te hemos enviado un email para confirmar tu cita". No redirige.
5. **Estilos** — CSS Modules co-located ([css-conventions](memory:feedback_pro_styling_iterations)). Tokens del tenant inyectados como CSS vars sobre el root del widget. Soporta `[data-template="..."]` per [demos-template-system](memory:project_demos_architecture).
6. **Accesibilidad** — ARIA en calendario (rol grid), focus trap entre pasos, navegación teclado en slots.
7. **Página de embed** `apps/es/app/(locale)/[locale]/reservas/page.tsx` para piloto de Alejandra (BeeMovement está en apps/es por ahora). Renderiza `<BookingFlow tenantKey={env.BOOKING_TENANT_KEY} />`.

### Definition of done

- [ ] Flujo completo en móvil (≤480px) sin scroll horizontal ni overflow
- [ ] Flujo en desktop (≥1024px) con buen uso del ancho (calendario y slots en columnas)
- [ ] Bilingüe — strings UI desde `messages/*.json` ([CLAUDE.md regla 4](../CLAUDE.md))
- [ ] Reservar de principio a fin dispara email y persiste booking
- [ ] Refrescar entre pasos no pierde estado (sessionStorage)
- [ ] Lighthouse accessibility ≥ 95 en la página de reservas

---

## Fase 6 — Admin UI (Día 4–5)

**Estado final**: `/admin/bookings` funcional, gated por `permissions.bookings`. Listado, filtros, detalle, configuración de horarios.

### Tareas

1. **Extender `AdminShell.tsx`** — leer `app_admins.permissions` en server component, pasar a la nav. Si `permissions.bookings !== true`, ocultar pestaña "Reservas".
2. **Página listado** `apps/es/app/(admin)/admin/bookings/page.tsx`:
   - Tabla con: fecha+hora, servicio, contacto, estado, acciones.
   - Filtros: estado, rango de fechas, servicio.
   - Paginación server-side.
3. **Detalle** `apps/es/app/(admin)/admin/bookings/[id]/page.tsx`:
   - Datos completos.
   - Acciones: cancelar (con razón), marcar `completed`, marcar `no_show`, reenviar email.
   - Audit log inline.
4. **Página configuración** `apps/es/app/(admin)/admin/bookings/settings/page.tsx`:
   - Visor read-only de `bookingConfig` (la edición sigue siendo en Sanity para no duplicar UI).
   - Botón "Editar en Studio" deep-link.
   - Estado actual del sync (última `_rev` vista, errores recientes).
5. **Componentes en `packages/bookings-admin-ui/`**:
   - `BookingsTable`, `BookingsFilters`, `BookingDetail`, `WeeklyScheduleViewer`.
6. **Server actions** en `apps/es/app/(admin)/admin/bookings/actions.ts` para acciones (cancelar, completar, etc.). Validan permisos contra `app_admins`.

### Definition of done

- [ ] Cliente con `permissions.bookings: false` NO ve la pestaña Reservas
- [ ] Cliente con `permissions.bookings: true` solo ve bookings de su tenant_id (RLS)
- [ ] Operator ve bookings de todos los tenants
- [ ] Cancelar desde admin dispara email cancelled al cliente final
- [ ] Audit log refleja quién hizo cada acción

---

## Fase 7 — Subdominio + cutover (Día 5–6)

**Estado final**: `bookings.ebecerra.es` activo, widget público sirve desde ahí. CORS configurado.

### Tareas

1. **Verificar DNS** — `nslookup bookings.ebecerra.es` apunta a Vercel.
2. **Alias en Vercel** — añadir `bookings.ebecerra.es` al proyecto `apps/es` (no es deploy separado; es alias).
3. **Routing en `apps/es`** — middleware `proxy.ts` ([feedback_nextjs16_proxy](memory:feedback_nextjs16_proxy)) detecta `host === 'bookings.ebecerra.es'` y reescribe a `/api/v1/bookings/*` y `/embed/*`. Páginas marketing siguen en `ebecerra.es`.
4. **CORS** en endpoints `/api/v1/bookings/*` — permitir origen del tenant (`booking_tenants.allowed_origins jsonb[]`). Mismo patrón que chatbot.
5. **Actualizar webhook Sanity** — apuntar a `bookings.ebecerra.es/api/saas/bookings-sync` en lugar de `ebecerra.es/...`.
6. **Smoke test** — curl a `https://bookings.ebecerra.es/api/v1/bookings/availability` con tenant key válida desde origen autorizado y desde no autorizado.

### Definition of done

- [ ] `bookings.ebecerra.es` resuelve, certificado SSL OK
- [ ] Widget embebido en `apps/es/reservas` consume desde el subdominio sin error CORS
- [ ] Origen no autorizado recibe 403 / CORS rejection
- [ ] Webhook Sanity llega al nuevo dominio

---

## Fase 8 — Piloto con BeeMovement (Día 6–7)

**Estado final**: Alejandra usa el sistema con clientes reales. Documentación de onboarding lista para próximo tenant.

### Tareas

1. **Crear `booking_tenants` row** para BeeMovement vía MCP Supabase. `requires_approval: false`, timezone Europe/Madrid.
2. **Configurar servicios en Sanity** — sesiones (50 min), tarifas, descripciones bilingüe.
3. **Configurar horarios** — weekly schedule + festivos del próximo trimestre.
4. **Generar tenant key**, añadirla al admin de Alejandra (`permissions.bookings: true`).
5. **Embeber widget** en su web actual (si la suya la mantiene su amigo, dar instrucciones de embed con iframe + tenant key pública, o consensuar un subdomain `reservas.beemovement.es` apuntado a `bookings.ebecerra.es` con su tenant).
6. **Documentar onboarding** en `docs/bookings-onboard-new-tenant.md` siguiendo el formato de `chatbot-onboard-new-tenant.md`.
7. **Monitor 2 semanas** — chequear logs, ajustar copy de emails, capturar feedback.

### Definition of done

- [ ] Alejandra reserva una sesión real consigo misma de prueba: confirm y cancel funcionan
- [ ] Email landing en su carpeta principal (no spam) — validar con `mail-tester.com`
- [ ] Documento de onboarding cubre: crear tenant, crear servicios, generar key, embed
- [ ] Memoria actualizada: `project_bookings_system.md`

---

## Fase 9 — Gestión de citas + hardening (post-V1, antes del piloto)

**Disparador**: feedback del 2026-05-22 — el flujo "confirm + cancel" del email es demasiado pobre. Cliente debe poder reagendar sin tener que cancelar y empezar de cero. Y el sistema debe tolerar carreras y pending abandonados sin double-bookings ni squat de huecos.

**Estado final**: página `/cita/{id}` en `bookings.ebecerra.es` con flujo completo de gestión (confirmar/cambiar/cancelar), cutoffs configurables, contador de reagendamientos, caducidad de pending, fix de carreras en confirm.

Estimación: **2 días** de trabajo. Migración aditiva — no rompe nada de Fases 1-8.

### Decisiones tomadas

| Decisión | Resolución |
|---|---|
| Default cutoff cancelar | **24h** antes del slot (configurable per-tenant) |
| Default cutoff reagendar | **24h** antes del slot (separado del de cancelar, configurable) |
| Reagendar permite cambiar servicio | **Sí** — reusa `<BookingFlow />` completo saltando Step 4 (datos ya conocidos) |
| Max reschedules por reserva | **5** (configurable per-tenant). Solo cuenta reschedules de bookings ya `confirmed`, no en `pending` |
| Caducidad de pending | **60 min** por defecto (configurable per-tenant 5-240). Confirm token caduca con el pending — un solo source of truth |
| Mínimo tiempo desde reserva al slot | **10 min** por defecto (configurable per-tenant). Reservas demasiado cercanas se rechazan al crear |
| URL de gestión | `bookings.ebecerra.es/cita/{booking-id}?token=<signed>`. Token autentica, ID solo display |
| Comportamiento en `pending` | 3 acciones (Confirmar / Cambiar / Cancelar). Cambiar = cancelar pending + crear nueva pending (re-confirmación necesaria) |
| Comportamiento en `confirmed` | 2 acciones (Cambiar / Cancelar), respetando cutoffs |
| Comportamiento en `cancelled`/`completed`/`no_show` | Solo lectura + CTA "Reservar otra cita" |

### Tareas

1. **Migración Supabase aditiva** `apps/es/supabase/migrations/<ts>_bookings_management.sql`:
   - `booking_tenants`:
     - `cancel_cutoff_hours int default 24` (NULL = sin cutoff)
     - `reschedule_cutoff_hours int default 24`
     - `max_reschedules_per_booking int default 5`
     - `pending_expires_in_minutes int default 60`
     - `min_minutes_to_slot int default 10`
     - `contact_phone text` (para mensaje "llama al negocio si quieres cambiar pasado el cutoff")
   - `bookings`:
     - `pending_expires_at timestamptz` (NULL para confirmed/cancelled/completed/no_show; valor para pending)
     - `replaces_booking_id uuid references bookings(id)` (NULL salvo reagendamientos — apunta a la cita anterior)
     - `reschedule_count int default 0`
     - Extender check `cancelled_by` para admitir `'rescheduled'` y `'slot_taken_by_another'` y `'expired'`
   - `booking_tokens.scope` check extendido para admitir `'manage'` (alias funcional del antiguo `'cancel'`)
   - Índice parcial `bookings_pending_expiring_idx on bookings (pending_expires_at) where status = 'pending'`

2. **Schemas Sanity** en `packages/sanity-booking-schema/src/schemas/bookingTenantConfig.ts` — añadir los 5 campos nuevos + `contactPhone`.

3. **Página `/cita/{id}`** — nueva ruta `apps/es/app/cita/[id]/page.tsx` (fuera del grupo locale, lee locale del booking). Sirve desde `bookings.ebecerra.es/cita/{id}?token=<signed>`:
   - Servidor valida token + carga booking + tenant + servicio + cutoffs
   - Si pending: muestra 3 botones
   - Si confirmed: muestra 2 botones (con cutoffs aplicados)
   - Si otros estados: read-only + CTA volver a reservar
   - Acción "Cambiar": monta `<BookingFlow />` con prop `mode="reschedule"` que salta Step 4 y al submit llama `/api/v1/bookings/reschedule`
   - `proxy.ts`: añadir excepción para permitir `/cita/*` HTML en host `bookings.*`

4. **API nuevos endpoints**:
   - `POST /api/v1/bookings/reschedule`:
     - Auth: manage token
     - Body: `{ new_slot_start_utc, new_service_id? }`
     - Validaciones: cutoff respetado, max_reschedules no superado, slot disponible (con NOT EXISTS atómico — ver fix carrera más abajo)
     - Lógica: marca cita original `cancelled` con `cancelled_by='rescheduled'`, crea nueva en `confirmed` (sin re-confirmación) con `replaces_booking_id = old.id` y `reschedule_count = old.reschedule_count + 1`
     - Email "Cita reagendada" con .ics nuevo + nuevo manage token
   - `GET /api/v1/bookings/by-token?token=<signed>` — endpoint server-side que la página `/cita/{id}` consume para hidratar (puede inlinear si SSR)

5. **Fix carrera en confirm** — `confirmBooking` cambia a UPDATE con `WHERE NOT EXISTS` subquery de bookings confirmados que solapen (ver detalle en sección dedicada abajo). Si el UPDATE devuelve 0 filas, marca la pending del segundo como `cancelled` con `cancelled_by='slot_taken_by_another'` y envía email "Tu cita no se pudo confirmar — el hueco se acaba de ocupar, [reserva otra]".

6. **Cron de cleanup pending expirados** — nuevo cron `apps/es/app/api/cron/booking-pending-cleanup/route.ts` (cada 15 min):
   - Busca `pending` con `pending_expires_at < now()`
   - Marca como `cancelled` con `cancelled_by='expired'`
   - Envía email "Tu reserva pendiente caducó porque no la confirmaste a tiempo. Reserva de nuevo si quieres."
   - Añadir al `apps/es/vercel.json`

7. **Emails nuevos**:
   - `BookingRescheduled` — confirmación del cambio con datos nuevos + .ics actualizado + link de gestionar
   - `BookingPendingExpired` — caducó el pending
   - `BookingSlotTakenByAnother` — alguien se quedó con el hueco antes
   Todos bilingüe ES/EN.

8. **Plantillas existentes**: actualizar `BookingPending`, `BookingConfirmed`, `BookingReminder24h` para que el segundo enlace sea "Gestionar cita" en lugar de "Cancelar cita" — apunta a `/cita/{id}?token=<signed>`.

9. **Widget `<BookingFlow />`** — añadir prop `mode?: 'create' | 'reschedule'` y `prefill?: { serviceId, contactData }`. En modo reschedule:
   - Step 1 muestra catálogo de servicios con el actual preseleccionado (cliente puede cambiar)
   - Step 4 se salta
   - Submit llama a `/reschedule` en vez de `/create`

10. **Adapter native** — `nativeProvider`:
    - Nuevo método `rescheduleBooking(params)` con validaciones (cutoff + max_reschedules + atomicidad)
    - `createBooking` ahora setea `pending_expires_at = min(now + tenant.pending_expires_in_minutes, slot_start - 5 min)`
    - `createBooking` rechaza si `slot_start - now < tenant.min_minutes_to_slot`
    - `confirmBooking` rechaza si `pending_expires_at < now()` con código `expired_pending`

### Sub-sección — Fix de carrera en confirm (detalle)

El UPDATE atómico:

```sql
UPDATE bookings SET status='confirmed', confirmed_at=now()
WHERE id = $booking_id
  AND status = 'pending'
  AND pending_expires_at >= now()
  AND NOT EXISTS (
    SELECT 1 FROM bookings b2
    WHERE b2.id <> $booking_id
      AND b2.booking_tenant_id = $tenant_id
      AND b2.status = 'confirmed'
      AND b2.slot_start_utc < $slot_end_with_buffer
      AND b2.slot_end_utc > $slot_start_with_buffer
  )
RETURNING *;
```

Si devuelve 0 filas, el endpoint:

1. Re-consulta el booking para distinguir el motivo: `expired_pending` (caducó), `slot_taken_by_another` (alguien confirmó antes), `already_confirmed` (idempotencia, devolver 200).
2. Si `slot_taken_by_another`: marca esa pending como `cancelled` con `cancelled_by='slot_taken_by_another'` y manda email.
3. Renderiza página adecuada en `/cita/{id}` o landing del confirm.

Capa 2 (`pg_advisory_xact_lock` en create) **no se implementa en V1**. El confirm atómico tapa el caso crítico; la doble-pending raro y se autoresuelve.

### Definition of done

- [ ] Cliente reserva con < 10 min al slot → 422 con mensaje "muy poco margen para confirmar"
- [ ] Cliente reserva pero no confirma → en 60 min el cron marca cancelled y manda email
- [ ] Cliente reserva, confirma, intenta cambiar a < 24h del slot → 422 "ya no se puede, llama al +34…"
- [ ] Cliente reschedule cambiando servicio → cita antigua cancelled con motivo 'rescheduled', nueva confirmed referenciándola
- [ ] Dos pending concurrentes en mismo slot → solo una puede confirmar; la otra recibe email "alguien se quedó con el hueco"
- [ ] `/cita/{id}` muestra UI distinta según estado (pending / confirmed / otros)
- [ ] Página `/cita/{id}` validada en móvil y desktop
- [ ] Cron `booking-pending-cleanup` configurado en `vercel.json` con schedule `*/15 * * * *`
- [ ] Memoria `project_bookings_system.md` actualizada con los flujos nuevos

---

## Fase 1.5 — Google Calendar one-way (opcional, post-piloto)

**Disparador**: el primer cliente pide ver las citas en su Google Calendar.

### Tareas a grandes rasgos

1. Google Cloud OAuth client (scopes: `calendar.events`).
2. Endpoint `/admin/bookings/settings/google` — OAuth flow para conectar la cuenta del negocio.
3. Guardar refresh token cifrado en `booking_tenants.google_calendar_refresh_token` (cifrado con clave en Vercel env).
4. Hook `onConfirm` → `google.calendar.events.insert`. Hook `onCancel` → `events.delete`. Hook `onUpdate` → `events.update`.
5. Idempotencia con `event.iCalUID = booking.ical_uid`.
6. Estado del sync visible en `/admin/bookings/settings`.

---

## Fase 2 — Adapters externos (futuro, bajo demanda)

Solo se construye cuando aparece el primer cliente que pide "yo ya uso X y no lo cambio". Orden de prioridad por penetración en autónomos/PYMEs España:

| Adapter | Cuándo | Coste estimado |
|---|---|---|
| **Calendly** | Cliente con Calendly activo | 1.5 días |
| **Cal.com** | Cliente self-hosted o nicho tech | 1 día (API limpia, OSS) |
| **Google Calendar Appointment Schedules** | Cliente Google Workspace que ya lo usa | 1 día |
| **Microsoft Bookings** | Cliente M365 | 1.5 días |
| **Acuity / Squarespace** | Cliente Squarespace | 2 días |
| **Booksy / Fresha** | Peluquería que ya las usa | 2–3 días (APIs menos abiertas) |
| **TuoTempo** | Cliente sector salud España | 2 días |

Cada adapter implementa `BookingProvider`. Frontend, admin y modelo de datos no cambian.

---

## Riesgos y decisiones diferidas

| Riesgo | Mitigación |
|---|---|
| Concurrencia (dos clientes reservan el mismo slot a la vez) | Re-check de disponibilidad dentro de la transacción de create; en V1 sin lock distribuido (un solo recurso, raro). |
| Zonas horarias confusas | Todo UTC en DB. Tenant tiene timezone, render siempre relativo a esa. Mostrar tz en emails. |
| Spam / abuse en `/create` | Rate limit por IP en el subdominio + email confirmación obligatoria antes de bloquear el slot (modo "hold"). **Decisión diferida**: V1 confirma inmediato (slot bloqueado al crear); si hay abuso, pivotar a "hold con expiración 15 min hasta click confirm". |
| Multi-recurso (peluquería 3 sillas) | V1 no lo soporta. Cuando aparezca, añadir tabla `booking_resources` y FK en services. Migración no destructiva. |
| Internacional (clientes fuera de Europa/Madrid) | El modelo aguanta (timezone por tenant). UI de selección de tz al embeber para cliente final si difiere del tenant — diferido. |

---

## Después de cada fase

- Commit siguiendo `/git-workflow` (heredoc fallback con `commit-msg.txt`).
- Push automático (push tras commit per [CLAUDE.md](../CLAUDE.md)).
- Update `docs/progress.md` con la fase cerrada y decisiones nuevas.
- Si hay cambios en el modelo: deploy schema Sanity antes de tocar contenido vía MCP ([feedback_sanity_mcp_gotchas](memory:feedback_sanity_mcp_gotchas)).
