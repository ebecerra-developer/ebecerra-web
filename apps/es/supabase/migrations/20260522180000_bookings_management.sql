-- Bookings Fase 9: gestión de citas + hardening.
-- Aplicada vía MCP el 2026-05-22 después de 20260522120000.
-- Aditiva, no rompe nada de Fases 1-8.

-- ============================================================
-- 1. booking_tenants — config nueva
-- ============================================================
alter table public.booking_tenants
  add column cancel_cutoff_hours        int,
  add column reschedule_cutoff_hours    int,
  add column max_reschedules_per_booking int not null default 5,
  add column pending_expires_in_minutes int not null default 60,
  add column min_minutes_to_slot        int not null default 10,
  add column contact_phone              text;

-- Default 24h para los tenants que ya existen (mantener compat con futuro onboarding).
update public.booking_tenants
  set cancel_cutoff_hours = 24,
      reschedule_cutoff_hours = 24
  where cancel_cutoff_hours is null;

comment on column public.booking_tenants.cancel_cutoff_hours is
  'Horas antes del slot tras las que el cliente final no puede cancelar online. NULL = sin cutoff (siempre se puede). El operador desde /admin sí puede cancelar igualmente.';
comment on column public.booking_tenants.reschedule_cutoff_hours is
  'Idem para reagendar. Separable del cancel_cutoff por si el negocio quiere distinto trato (ej. reagendar hasta 48h, cancelar hasta 24h).';
comment on column public.booking_tenants.max_reschedules_per_booking is
  'Tope de veces que una reserva confirmed puede reagendarse. 0 = bloquea reagendar totalmente.';
comment on column public.booking_tenants.pending_expires_in_minutes is
  'Cuántos minutos vive un pending sin confirmar antes de auto-cancelarse. Default 60. Min razonable 5, max 240 (configurable desde Sanity).';
comment on column public.booking_tenants.min_minutes_to_slot is
  'No se acepta reservar con menos de N minutos de margen al slot — sino el cliente no tiene tiempo de confirmar el email.';
comment on column public.booking_tenants.contact_phone is
  'Teléfono mostrado en mensajes de cutoff ("ya no se puede cambiar online, llama al +34…"). Opcional.';

-- ============================================================
-- 2. bookings — campos nuevos para gestión
-- ============================================================
alter table public.bookings
  add column pending_expires_at   timestamptz,
  add column replaces_booking_id  uuid references public.bookings(id) on delete set null,
  add column reschedule_count     int not null default 0;

-- Extender check cancelled_by con valores nuevos.
alter table public.bookings drop constraint bookings_cancelled_by_check;
alter table public.bookings add constraint bookings_cancelled_by_check
  check (cancelled_by in (
    'customer', 'business', 'expired',
    'rescheduled',                 -- reschedule cierra la antigua así
    'slot_taken_by_another'        -- doble pending, alguien confirmó antes
  ));

-- Índice parcial para el cron de cleanup (solo afecta filas pending).
create index bookings_pending_expiring_idx
  on public.bookings (pending_expires_at)
  where status = 'pending';

-- Apuntador inverso de auditoría (qué nueva reserva sustituye una vieja).
create index bookings_replaces_idx on public.bookings (replaces_booking_id);

comment on column public.bookings.pending_expires_at is
  'Sólo poblada para pending. min(now + tenant.pending_expires_in_minutes, slot_start - 5min). Tras esto, el pending se trata como caducado en availability y el cron lo marca cancelled.';
comment on column public.bookings.replaces_booking_id is
  'Si es un reagendamiento, apunta a la reserva original (que estará cancelled con cancelled_by=rescheduled).';

-- ============================================================
-- 3. booking_tokens.scope — admitir 'manage'
-- ============================================================
alter table public.booking_tokens drop constraint booking_tokens_scope_check;
alter table public.booking_tokens add constraint booking_tokens_scope_check
  check (scope in ('confirm', 'cancel', 'manage'));

comment on column public.booking_tokens.scope is
  '"confirm" para activar pending → confirmed. "manage" (preferido a partir de 2026-05-22) para gestionar (cancelar/reagendar) desde la página /cita/{id}. "cancel" se mantiene para tokens emitidos antes del 2026-05-22, sigue funcionando para cancelar.';
