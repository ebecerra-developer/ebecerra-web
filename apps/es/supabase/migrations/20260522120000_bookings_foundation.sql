-- Bookings (reservas) foundation: multi-tenant tables.
-- Aplicada vía MCP el 2026-05-22.
--
-- Plan de implementación: docs/bookings-implementation-plan-2026-05-22.md
-- Reutiliza: public.tenants (chatbot SaaS), public.app_admins (magic link admin).

-- ============================================================
-- 0. app_admins.permissions — flag por módulo
-- ============================================================
alter table public.app_admins
  add column permissions jsonb not null default '{}'::jsonb;

comment on column public.app_admins.permissions is
  'Flags por módulo, ej. {"chatbot": true, "bookings": true}. La nav del /admin oculta pestañas si el flag está apagado. Operators (role in owner/editor) ven todo independientemente de este campo.';

-- Backfill: operators tenían chatbot implícito, ahora explícito y con bookings.
update public.app_admins
  set permissions = jsonb_build_object('chatbot', true, 'bookings', true)
  where role in ('owner', 'editor');

-- Clients existentes solo tenían chatbot.
update public.app_admins
  set permissions = jsonb_build_object('chatbot', true)
  where role = 'client';

-- ============================================================
-- 1. BOOKING_TENANTS — un row por tenant que tiene reservas activadas
-- ============================================================
create table public.booking_tenants (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null unique references public.tenants(id) on delete cascade,
  slug                     text not null unique,
  name                     text not null,
  timezone                 text not null default 'Europe/Madrid',
  currency                 text not null default 'EUR',
  default_locale           text not null default 'es',
  requires_approval        boolean not null default false,
  cancellation_policy      jsonb not null default '{}'::jsonb,
  contact_email            text not null,
  branding_logo_url        text,
  branding_color_primary   text,
  allowed_origins          jsonb not null default '[]'::jsonb,
  api_key_hash             text not null unique,
  api_key_prefix           text not null,
  status                   text not null default 'active'
                             check (status in ('active','paused','archived')),
  monthly_booking_limit    int not null default 1000,
  sanity_project_id        text,
  sanity_dataset           text,
  sanity_workspace         text,
  sanity_document_id       text,
  sanity_match_type        text not null default 'document_id'
                             check (sanity_match_type in ('document_id','document_type')),
  google_calendar_refresh_token text,
  reminder_hours_before    int not null default 24,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index booking_tenants_status_idx on public.booking_tenants (status);
create index booking_tenants_sanity_lookup_idx on public.booking_tenants (sanity_project_id, sanity_document_id);

comment on table public.booking_tenants is
  'Tenants con sistema de reservas activado. FK a tenants (compartido con chatbot). Una fila por negocio.';
comment on column public.booking_tenants.api_key_hash is
  'SHA-256 del raw BOOKING_TENANT_KEY. Nunca guardar el raw.';
comment on column public.booking_tenants.allowed_origins is
  'JSON array de origins permitidos para CORS, ej. ["https://beemovement.es"]. Vacío = cualquier origen (no recomendado en producción).';
comment on column public.booking_tenants.cancellation_policy is
  'Política bilingüe, ej. {"es": "Cancelable hasta 24h antes.", "en": "Cancellable up to 24h before."}';
comment on column public.booking_tenants.google_calendar_refresh_token is
  'Refresh token OAuth para sync one-way a Google Calendar del negocio. Cifrado en columna. NULL = sync desactivado (Fase 1.5).';

-- ============================================================
-- 2. BOOKING_SERVICES — catálogo de servicios reservables
-- ============================================================
create table public.booking_services (
  id                    uuid primary key default gen_random_uuid(),
  booking_tenant_id     uuid not null references public.booking_tenants(id) on delete cascade,
  sanity_document_id    text not null,
  name                  jsonb not null,
  description           jsonb not null default '{}'::jsonb,
  duration_min          int not null check (duration_min > 0),
  buffer_before_min     int not null default 0 check (buffer_before_min >= 0),
  buffer_after_min      int not null default 0 check (buffer_after_min >= 0),
  price_cents           int,
  currency              text not null default 'EUR',
  color                 text,
  active                boolean not null default true,
  sort_order            int not null default 0,
  source_revision       text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (booking_tenant_id, sanity_document_id)
);

create index booking_services_tenant_active_idx
  on public.booking_services (booking_tenant_id, active, sort_order);

comment on table public.booking_services is
  'Servicios reservables sincronizados desde Sanity. name y description son jsonb bilingüe {es, en}.';
comment on column public.booking_services.price_cents is
  'NULL = "consultar" / sin precio público. Mostrar en la web según locale.';

-- ============================================================
-- 3. BOOKING_WEEKLY_SCHEDULES — horario recurrente por día de semana
-- ============================================================
create table public.booking_weekly_schedules (
  id                    uuid primary key default gen_random_uuid(),
  booking_tenant_id     uuid not null references public.booking_tenants(id) on delete cascade,
  weekday               int not null check (weekday between 0 and 6),
  start_time            time not null,
  end_time              time not null,
  created_at            timestamptz not null default now(),
  check (end_time > start_time)
);

create index booking_weekly_schedules_tenant_idx
  on public.booking_weekly_schedules (booking_tenant_id, weekday);

comment on table public.booking_weekly_schedules is
  'Horario recurrente del negocio. Varios tramos por día permitidos (mañana+tarde = 2 filas). weekday: 0=domingo, 1=lunes, … 6=sábado (convención PG).';

-- ============================================================
-- 4. BOOKING_AVAILABILITY_OVERRIDES — fechas específicas (vacaciones, festivos, hora extra)
-- ============================================================
create table public.booking_availability_overrides (
  id                    uuid primary key default gen_random_uuid(),
  booking_tenant_id     uuid not null references public.booking_tenants(id) on delete cascade,
  override_date         date not null,
  kind                  text not null check (kind in ('closed','extra')),
  start_time            time,
  end_time              time,
  reason                text,
  created_at            timestamptz not null default now(),
  check (
    (kind = 'closed' and start_time is null and end_time is null) or
    (kind = 'closed' and start_time is not null and end_time is not null and end_time > start_time) or
    (kind = 'extra' and start_time is not null and end_time is not null and end_time > start_time)
  )
);

create index booking_availability_overrides_tenant_date_idx
  on public.booking_availability_overrides (booking_tenant_id, override_date);

comment on table public.booking_availability_overrides is
  'Excepciones al horario semanal. closed sin tramos = día entero cerrado. closed con tramos = cierra solo esas horas. extra = abre fuera del horario habitual.';

-- ============================================================
-- 5. BOOKINGS — reservas reales
-- ============================================================
create table public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  booking_tenant_id     uuid not null references public.booking_tenants(id) on delete cascade,
  service_id            uuid not null references public.booking_services(id) on delete restrict,
  slot_start_utc        timestamptz not null,
  slot_end_utc          timestamptz not null,
  status                text not null default 'pending'
                          check (status in ('pending','confirmed','cancelled','completed','no_show')),
  contact_name          text not null,
  contact_email         citext not null,
  contact_phone         text,
  notes                 text,
  locale                text not null default 'es',
  ical_uid              text not null unique,
  reminder_sent_at      timestamptz,
  confirmed_at          timestamptz,
  cancelled_at          timestamptz,
  cancelled_by          text check (cancelled_by in ('customer','business','expired')),
  cancellation_reason   text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (slot_end_utc > slot_start_utc)
);

create index bookings_tenant_slot_idx
  on public.bookings (booking_tenant_id, slot_start_utc);
create index bookings_tenant_status_idx
  on public.bookings (booking_tenant_id, status);
create index bookings_email_idx
  on public.bookings (contact_email);
create index bookings_reminder_pending_idx
  on public.bookings (slot_start_utc)
  where status = 'confirmed' and reminder_sent_at is null;

comment on table public.bookings is
  'Reservas. slot_start/end en UTC. Render en zona del tenant (booking_tenants.timezone).';
comment on column public.bookings.ical_uid is
  'UID RFC 5545 para .ics, ej. "bookings.ebecerra.es+<booking_id>". Permite update/delete idempotente desde calendarios externos.';

-- ============================================================
-- 6. BOOKING_TOKENS — magic links para confirm/cancel del visitante
-- ============================================================
create table public.booking_tokens (
  id           uuid primary key default gen_random_uuid(),
  token_hash   text not null unique,
  booking_id   uuid not null references public.bookings(id) on delete cascade,
  scope        text not null check (scope in ('confirm','cancel')),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  used_at      timestamptz
);

create index booking_tokens_booking_scope_idx on public.booking_tokens (booking_id, scope);
create index booking_tokens_expires_idx on public.booking_tokens (expires_at);

comment on table public.booking_tokens is
  'Tokens one-time para confirmar o cancelar reserva. Se hashea raw → hash. El raw solo viaja en el email. HMAC adicional con BOOKINGS_TOKEN_SECRET en la app.';

-- ============================================================
-- 7. BOOKING_AUDIT_LOG — eventos del sistema de reservas
-- ============================================================
create table public.booking_audit_log (
  id                  uuid primary key default gen_random_uuid(),
  booking_tenant_id   uuid references public.booking_tenants(id) on delete cascade,
  booking_id          uuid references public.bookings(id) on delete cascade,
  actor_email         text,
  action              text not null,
  details             jsonb,
  created_at          timestamptz not null default now()
);

create index booking_audit_log_tenant_idx
  on public.booking_audit_log (booking_tenant_id, created_at desc);
create index booking_audit_log_booking_idx
  on public.booking_audit_log (booking_id, created_at desc);

comment on table public.booking_audit_log is
  'Eventos: booking.created, booking.confirmed, booking.cancelled, config.synced, key.rotated, etc.';

-- ============================================================
-- 8. RLS — Row Level Security
-- ============================================================
alter table public.booking_tenants                enable row level security;
alter table public.booking_services               enable row level security;
alter table public.booking_weekly_schedules       enable row level security;
alter table public.booking_availability_overrides enable row level security;
alter table public.bookings                       enable row level security;
alter table public.booking_tokens                 enable row level security;
alter table public.booking_audit_log              enable row level security;

-- Operator: ve todo
create policy operator_all_booking_tenants on public.booking_tenants
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_booking_services on public.booking_services
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_weekly_schedules on public.booking_weekly_schedules
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_availability_overrides on public.booking_availability_overrides
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_bookings on public.bookings
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_booking_tokens on public.booking_tokens
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_booking_audit on public.booking_audit_log
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

-- Client: solo ve su tenant Y necesita flag permissions.bookings = true
create policy client_own_booking_tenant on public.booking_tenants
  for select using (
    tenant_id in (
      select aa.tenant_id from public.app_admins aa
      where aa.email::text = auth.jwt() ->> 'email'
        and aa.role = 'client'
        and (aa.permissions->>'bookings')::boolean is true
    )
  );

create policy client_own_booking_services on public.booking_services
  for select using (
    booking_tenant_id in (
      select bt.id from public.booking_tenants bt
      join public.app_admins aa on aa.tenant_id = bt.tenant_id
      where aa.email::text = auth.jwt() ->> 'email'
        and aa.role = 'client'
        and (aa.permissions->>'bookings')::boolean is true
    )
  );

create policy client_own_bookings on public.bookings
  for all using (
    booking_tenant_id in (
      select bt.id from public.booking_tenants bt
      join public.app_admins aa on aa.tenant_id = bt.tenant_id
      where aa.email::text = auth.jwt() ->> 'email'
        and aa.role = 'client'
        and (aa.permissions->>'bookings')::boolean is true
    )
  );

create policy client_own_booking_audit on public.booking_audit_log
  for select using (
    booking_tenant_id in (
      select bt.id from public.booking_tenants bt
      join public.app_admins aa on aa.tenant_id = bt.tenant_id
      where aa.email::text = auth.jwt() ->> 'email'
        and aa.role = 'client'
        and (aa.permissions->>'bookings')::boolean is true
    )
  );

-- ============================================================
-- 9. Triggers: auto-update updated_at
-- ============================================================
-- update_updated_at_column() ya existe (creada en migración chatbot 20260521120000)
create trigger booking_tenants_updated_at
  before update on public.booking_tenants
  for each row execute function public.update_updated_at_column();

create trigger booking_services_updated_at
  before update on public.booking_services
  for each row execute function public.update_updated_at_column();

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.update_updated_at_column();
