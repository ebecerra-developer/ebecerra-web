# Guía: dar de alta un tenant nuevo en el sistema de reservas

Receta paso a paso para añadir un negocio al sistema multi-tenant de reservas.

**Plan completo:** [bookings-implementation-plan-2026-05-22.md](./bookings-implementation-plan-2026-05-22.md)

---

## 1. Generar BOOKING_TENANT_KEY

```bash
node -e '
const c = require("crypto");
const raw = "btk_" + c.randomBytes(32).toString("hex");
const hash = c.createHash("sha256").update(raw).digest("hex");
console.log(JSON.stringify({raw, hash, prefix: raw.slice(0,12)}, null, 2));
'
```

Guarda los tres valores. El `raw` se entrega al cliente (env var pública en su web); el `hash` y `prefix` van a Supabase.

---

## 2. Provisionar tenant en Supabase

El sistema de reservas reutiliza la tabla `tenants` del chatbot SaaS. Hay dos casos:

### 2a. El cliente ya es tenant del chatbot

Si ya tiene fila en `tenants` (porque usa chatbot), solo añade la fila en `booking_tenants` apuntando al mismo `tenant_id`:

```sql
insert into public.booking_tenants
  (tenant_id, slug, name, timezone, currency, default_locale,
   requires_approval, contact_email,
   api_key_hash, api_key_prefix,
   sanity_project_id, sanity_dataset, sanity_workspace, sanity_document_id,
   monthly_booking_limit)
values
  ('<TENANT_ID_EXISTENTE>',
   '<slug>',                       -- ej. 'beemovement'
   '<Nombre comercial>',
   'Europe/Madrid',
   'EUR',
   'es',
   false,                          -- true si quieres aprobar manualmente cada cita
   '<email del negocio>',
   '<HASH>',
   '<PREFIX>',
   'gdtxcn4l',                     -- apps/es Sanity project id (cambia si tiene su propio Sanity)
   'production',
   'ebecerra-web',
   '<SANITY_DOC_ID>',              -- _id del bookingTenantConfig que crearemos en el paso 4
   1000)
returning id;
```

### 2b. El cliente es nuevo (sin chatbot)

Primero crea el `tenants` row, luego el `booking_tenants`:

```sql
-- Paso 2b.1 — crea tenant base
insert into public.tenants
  (slug, name, config_source, sanity_project_id, sanity_dataset,
   sanity_workspace, sanity_document_id, sanity_match_type, sanity_field_path,
   tenant_key_hash, tenant_key_prefix, monthly_message_limit, status)
values
  ('<slug>', '<Nombre>', 'sanity_proxy',
   'gdtxcn4l', 'production', 'ebecerra-web',
   '__no_chatbot__', 'document_id', NULL,
   '__chatbot_disabled__', '__none__', 0, 'active')
returning id;
```

> Nota: el chatbot SaaS exige `tenant_key_hash` único y NOT NULL. Si el cliente no tiene chatbot, usa placeholders no-utilizables.

Luego ejecuta el insert en `booking_tenants` del paso 2a usando el `id` recién devuelto.

Guarda el `id` del nuevo `booking_tenants` (UUID) — lo usaremos a continuación.

---

## 3. Crear el documento `bookingTenantConfig` en Sanity

Desde el Studio (`/studio` en apps/es), entra en **Reservas → Tenants (configuración)** y crea un documento nuevo:

| Campo | Ejemplo |
|---|---|
| Slug | `beemovement` (debe coincidir con `booking_tenants.slug`) |
| Nombre | `BeeMovement` |
| Timezone | `Europe/Madrid` |
| Currency | `EUR` |
| Default locale | `es` |
| Requires approval | `false` (recomendado) |
| Cancellation policy | bilingüe ES+EN |
| Contact email | email del negocio |
| Reminder hours before | `24` |
| Weekly schedule | array con los tramos abiertos (mañana / tarde por día) |
| Availability overrides | vacío inicialmente |
| Allowed origins | `["https://beemovement.es"]` u otra URL desde donde se embeba el widget |

Al **publicar**, dispara el webhook de Sanity. El webhook llega a `/api/revalidate` que internamente llama a `handleBookingsSyncWebhook` y actualiza la fila de `booking_tenants` + tablas hijas (`booking_weekly_schedules`, `booking_availability_overrides`).

**IMPORTANTE — primera publicación:** tras publicar, copia el `_id` del documento desde el panel "Inspect" (botón en el menú superior derecho del editor) y actualiza la fila en Supabase:

```sql
update public.booking_tenants
  set sanity_document_id = '<EL_ID_QUE_COPIASTE>'
  where id = '<BOOKING_TENANT_ID>';
```

A partir de aquí, todas las publicaciones futuras del doc se sincronizan automáticamente.

---

## 4. Crear los servicios en Sanity

Por cada servicio reservable: Studio → **Reservas → Servicios → Crear nuevo**.

| Campo | Ejemplo |
|---|---|
| Tenant | (referencia al `bookingTenantConfig` del paso 3) |
| Name | localeString bilingüe |
| Description | localeText bilingüe |
| Duration min | duración en minutos (ej. 50) |
| Buffer before / after | margen pre/post cita (ej. 5 min cada uno) |
| Price cents | 5000 = 50 € (vacío = "consultar") |
| Color | hex opcional |
| Active | `true` |
| Sort order | número (0 = primero) |

Al publicar, el webhook sincroniza el servicio a `booking_services`.

---

## 5. Conceder permiso al cliente en /admin (opcional)

Si el cliente debe poder ver sus reservas desde `/admin/bookings`:

```sql
insert into public.app_admins (email, role, tenant_id, permissions)
values
  ('<email del cliente>',
   'client',
   '<TENANT_ID>',                  -- el tenants.id, no booking_tenants.id
   jsonb_build_object('bookings', true))
on conflict (email) do update
  set tenant_id  = excluded.tenant_id,
      permissions = public.app_admins.permissions ||
                    jsonb_build_object('bookings', true);
```

Tras esto el cliente puede:
1. Ir a `https://<su-dominio>/admin/login`
2. Pedir magic link → llega a su email
3. Tras el callback ve la pestaña **Reservas** en /admin (oculta para clientes sin el flag).

---

## 6. Entregar la BOOKING_TENANT_KEY al cliente

El cliente añade en su web (dependiendo del stack):

### Embed desde un Next.js / React
```tsx
import { BookingFlow } from "@ebecerra/bookings/widget";

<BookingFlow
  apiBase="https://bookings.ebecerra.es"
  tenantKey={process.env.NEXT_PUBLIC_BOOKING_TENANT_KEY}  // la raw key
  locale="es"
/>
```

### Embed simple (cualquier web) — iframe
Si el cliente no es Next/React, le damos una URL como:
```
https://bookings.ebecerra.es/reservas?tenant=<slug>
```
Y la embebe con `<iframe src="...">`. (Endpoint pendiente — V1.1, solo si aparece un cliente que lo necesite.)

---

## 7. Smoke test

Con curl (sustituye `<KEY>`):

```bash
# 1. Catálogo
curl -H "X-Tenant-Key: <KEY>" \
     https://bookings.ebecerra.es/api/v1/bookings/services

# 2. Disponibilidad del próximo mes
curl -X POST -H "X-Tenant-Key: <KEY>" -H "Content-Type: application/json" \
     -d '{"service_id":"<SVC_ID>","from_utc":"2026-05-23T00:00:00Z","to_utc":"2026-06-22T00:00:00Z"}' \
     https://bookings.ebecerra.es/api/v1/bookings/availability

# 3. Crear reserva real (vas a recibir email)
curl -X POST -H "X-Tenant-Key: <KEY>" -H "Content-Type: application/json" \
     -d '{"service_id":"<SVC_ID>","slot_start_utc":"2026-05-25T09:00:00Z","contact":{"name":"Test","email":"tu@email.com"}}' \
     https://bookings.ebecerra.es/api/v1/bookings/create
```

Verifica:
- [ ] Llega email "Confirma tu cita" con dos links válidos
- [ ] Click en confirm → landing "Cita confirmada" + email con .ics
- [ ] El .ics importa OK en Google Calendar / Apple Calendar
- [ ] La cita aparece en `/admin/bookings` (operator y client si tiene flag)
- [ ] Click en cancel → landing "Cita cancelada" + email confirmación

---

## Troubleshooting

| Síntoma | Causa probable | Cómo arreglar |
|---|---|---|
| Webhook llega pero el log dice `No booking_tenant matched` | `booking_tenants.sanity_document_id` desfasado o sin actualizar tras el paso 3 | Re-ejecuta el UPDATE del paso 3, vuelve a publicar |
| Widget devuelve 401 | `BOOKING_TENANT_KEY` no coincide con el hash en DB | Revisa que el raw que diste al cliente es el mismo del que generaste el hash |
| Widget devuelve CORS rejection | Origen del cliente no está en `allowed_origins` | Añade la URL en Sanity → publica → se sincroniza |
| Disponibilidad sale vacía aunque hay horario | `booking_weekly_schedules` está vacía (sync no llegó) | Re-publica el `bookingTenantConfig` para forzar sync |
| Email de confirmación nunca llega | Resend devuelve error o el FROM no está verificado en Resend | Mira logs Vercel del endpoint `/api/v1/bookings/create` |
| Recordatorio no llega | `reminder_sent_at` ya está marcado, o cron no se ejecuta | Verifica en Vercel → Cron Jobs que el cron de `/api/cron/booking-reminders` está activo |

---

## Lo que NO está en V1

- Multi-recurso (peluquería con 3 sillas, clínica con 4 médicos) — requiere migración aditiva
- Sync a Google Calendar del negocio — Fase 1.5 del plan
- Adapters externos (Calendly, Cal.com, Microsoft Bookings, etc.) — Fase 2 del plan
- Sub-nav dedicada de bookings dentro del widget — solo el componente 4-pasos
- Página /admin/bookings/settings con visor de bookingConfig — pendiente menor (Studio cubre la edición)
- Iframe con `?tenant=<slug>` en URL — si lo pide un cliente sin React, V1.1
