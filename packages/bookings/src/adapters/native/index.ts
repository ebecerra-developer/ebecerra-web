import { getSupabase, logAudit } from "../../db";
import { calculateSlots } from "../../slots";
import { issueToken, consumeToken } from "../../tokens";
import type {
  Booking,
  BookingService,
  BookingTenant,
  Slot,
} from "../../types";
import type {
  BookingProvider,
  CreateBookingParams,
  CreatedBooking,
  ConfirmedBooking,
} from "../types";

/**
 * Adapter "native": Supabase como única fuente de verdad.
 *
 * Otros adapters (Calendly, Cal.com, Google Appointments) en Fase 2 del plan
 * implementarán la misma interface BookingProvider.
 */
export const nativeProvider: BookingProvider = {
  async getTenant({ bookingTenantId }) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("booking_tenants")
      .select("*")
      .eq("id", bookingTenantId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`booking_tenant ${bookingTenantId} not found`);
    return data as BookingTenant;
  },

  async getServices({ bookingTenantId }) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("booking_services")
      .select("*")
      .eq("booking_tenant_id", bookingTenantId)
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as BookingService[];
  },

  async getAvailability({ bookingTenantId, serviceId, fromUtc, toUtc }) {
    const supabase = getSupabase();
    const nowIso = new Date().toISOString();

    // Tenant + service + weekly + overrides + occupied bookings en paralelo.
    // Occupied = confirmed + pending VIVO (no caducado).
    const [tenantRes, serviceRes, weeklyRes, overridesRes, occupiedRes] =
      await Promise.all([
        supabase
          .from("booking_tenants")
          .select("timezone")
          .eq("id", bookingTenantId)
          .maybeSingle(),
        supabase
          .from("booking_services")
          .select("duration_min, buffer_before_min, buffer_after_min, active")
          .eq("id", serviceId)
          .eq("booking_tenant_id", bookingTenantId)
          .maybeSingle(),
        supabase
          .from("booking_weekly_schedules")
          .select("weekday, start_time, end_time")
          .eq("booking_tenant_id", bookingTenantId),
        supabase
          .from("booking_availability_overrides")
          .select("override_date, kind, start_time, end_time")
          .eq("booking_tenant_id", bookingTenantId)
          .gte("override_date", fromUtc.slice(0, 10))
          .lte("override_date", toUtc.slice(0, 10)),
        // Pending caducados NO bloquean (los excluimos aquí; el cron luego los marca cancelled).
        supabase
          .from("bookings")
          .select("slot_start_utc, slot_end_utc, status, pending_expires_at")
          .eq("booking_tenant_id", bookingTenantId)
          .in("status", ["pending", "confirmed"])
          .gte("slot_start_utc", fromUtc)
          .lte("slot_start_utc", toUtc),
      ]);

    if (tenantRes.error) throw tenantRes.error;
    if (serviceRes.error) throw serviceRes.error;
    if (weeklyRes.error) throw weeklyRes.error;
    if (overridesRes.error) throw overridesRes.error;
    if (occupiedRes.error) throw occupiedRes.error;

    if (!tenantRes.data) throw new Error("Tenant not found");
    if (!serviceRes.data || !serviceRes.data.active) return [];

    const occupied = (occupiedRes.data ?? [])
      .filter((b) => {
        if (b.status === "confirmed") return true;
        // pending solo cuenta como ocupado si todavía está vivo.
        if (!b.pending_expires_at) return true;
        return b.pending_expires_at >= nowIso;
      })
      .map((o) => ({ start_utc: o.slot_start_utc, end_utc: o.slot_end_utc }));

    return calculateSlots({
      timezone: tenantRes.data.timezone,
      fromUtc: new Date(fromUtc),
      toUtc: new Date(toUtc),
      durationMin: serviceRes.data.duration_min,
      bufferBeforeMin: serviceRes.data.buffer_before_min,
      bufferAfterMin: serviceRes.data.buffer_after_min,
      weeklySchedule: weeklyRes.data ?? [],
      overrides: overridesRes.data ?? [],
      occupied,
    });
  },

  async createBooking(params: CreateBookingParams): Promise<CreatedBooking> {
    const supabase = getSupabase();

    // 1. Validar servicio + obtener duración + cargar config del tenant.
    const [svcRes, tenantRes] = await Promise.all([
      supabase
        .from("booking_services")
        .select(
          "id, duration_min, buffer_before_min, buffer_after_min, active, booking_tenant_id"
        )
        .eq("id", params.serviceId)
        .eq("booking_tenant_id", params.bookingTenantId)
        .maybeSingle(),
      supabase
        .from("booking_tenants")
        .select("pending_expires_in_minutes, min_minutes_to_slot, requires_approval")
        .eq("id", params.bookingTenantId)
        .maybeSingle(),
    ]);
    if (svcRes.error) throw svcRes.error;
    if (tenantRes.error) throw tenantRes.error;
    const service = svcRes.data;
    const tenantCfg = tenantRes.data;
    if (!service || !service.active) {
      throw new BookingError("service_not_found", "Service not found or inactive");
    }
    if (!tenantCfg) {
      throw new BookingError("tenant_not_found", "Tenant not found");
    }

    const now = Date.now();
    const slotStartMs = new Date(params.slotStartUtc).getTime();
    if (!Number.isFinite(slotStartMs)) {
      throw new BookingError("invalid_slot", "Invalid slot_start_utc");
    }
    if (slotStartMs < now) {
      throw new BookingError("slot_in_past", "Slot is in the past");
    }

    // 2. Mínimo margen al slot — cliente debe tener tiempo de confirmar el email.
    const minMs = tenantCfg.min_minutes_to_slot * 60_000;
    if (slotStartMs - now < minMs) {
      throw new BookingError(
        "too_close_to_slot",
        `Need at least ${tenantCfg.min_minutes_to_slot} min margin to slot`
      );
    }

    const slotEndMs = slotStartMs + service.duration_min * 60_000;
    const slotEndUtc = new Date(slotEndMs).toISOString();
    const slotStartIso = new Date(slotStartMs).toISOString();

    // 3. Re-check de disponibilidad con buffers.
    const bufBefore = service.buffer_before_min * 60_000;
    const bufAfter = service.buffer_after_min * 60_000;
    const windowFrom = new Date(slotStartMs - bufBefore).toISOString();
    const windowTo = new Date(slotEndMs + bufAfter).toISOString();
    const nowIso = new Date(now).toISOString();

    const { data: conflicts, error: confErr } = await supabase
      .from("bookings")
      .select("id, status, pending_expires_at")
      .eq("booking_tenant_id", params.bookingTenantId)
      .in("status", ["pending", "confirmed"])
      .lt("slot_start_utc", windowTo)
      .gt("slot_end_utc", windowFrom);
    if (confErr) throw confErr;
    const alive = (conflicts ?? []).filter((c) => {
      if (c.status === "confirmed") return true;
      return !c.pending_expires_at || c.pending_expires_at >= nowIso;
    });
    if (alive.length > 0) {
      throw new SlotTakenError(slotStartIso);
    }

    // 4. Calcular pending_expires_at = min(now + N min, slot_start - 5 min).
    const pendingExpiresMs = Math.min(
      now + tenantCfg.pending_expires_in_minutes * 60_000,
      slotStartMs - 5 * 60_000
    );
    const pendingExpiresAt = new Date(pendingExpiresMs).toISOString();

    // 5. Insert booking (placeholder ical_uid, lo actualizamos con el id real).
    const placeholderUid = `tmp-${crypto.randomUUID()}`;
    const { data: created, error: insErr } = await supabase
      .from("bookings")
      .insert({
        booking_tenant_id: params.bookingTenantId,
        service_id: service.id,
        slot_start_utc: slotStartIso,
        slot_end_utc: slotEndUtc,
        status: "pending",
        contact_name: params.contact.name,
        contact_email: params.contact.email,
        contact_phone: params.contact.phone ?? null,
        notes: params.contact.notes ?? null,
        locale: params.locale ?? "es",
        ical_uid: placeholderUid,
        pending_expires_at: pendingExpiresAt,
      })
      .select("id, slot_start_utc, slot_end_utc, status")
      .single();
    if (insErr) throw insErr;
    if (!created) throw new Error("Insert failed");

    const icalUid = `bookings.ebecerra.es+${created.id}`;
    const { error: updErr } = await supabase
      .from("bookings")
      .update({ ical_uid: icalUid })
      .eq("id", created.id);
    if (updErr) throw updErr;

    // 6. Emitir tokens. Confirm vence con el pending. Manage vence al slot.
    const [confirm, manage] = await Promise.all([
      issueToken({
        bookingId: created.id,
        scope: "confirm",
        expiresAt: new Date(pendingExpiresMs),
      }),
      issueToken({
        bookingId: created.id,
        scope: "manage",
        expiresAt: new Date(slotStartMs),
      }),
    ]);

    await logAudit({
      booking_tenant_id: params.bookingTenantId,
      booking_id: created.id,
      action: "booking.created",
      details: {
        slot_start_utc: slotStartIso,
        pending_expires_at: pendingExpiresAt,
      },
    });

    return {
      bookingId: created.id,
      slotStartUtc: created.slot_start_utc,
      slotEndUtc: created.slot_end_utc,
      confirmToken: confirm.signed,
      cancelToken: manage.signed,
      status: created.status as Booking["status"],
    };
  },

  async confirmBooking({ rawToken, bookingId, tokenScope = "confirm" }): Promise<ConfirmedBooking> {
    // tokenScope: 'confirm' para flujo normal del email, 'manage' cuando la página
    // /cita/{id} (pending) cliquea "Confirmar mi cita" con su manage token.
    const result = await consumeToken({
      signedToken: rawToken,
      expectedScope: tokenScope,
    });
    if (!result.ok) throw new TokenError(result.reason);
    if (result.bookingId !== bookingId) {
      throw new TokenError("not_found");
    }

    const supabase = getSupabase();

    // Cargar la booking + servicio para conocer slot + buffers.
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select(
        "id, booking_tenant_id, service_id, slot_start_utc, slot_end_utc, status, pending_expires_at"
      )
      .eq("id", bookingId)
      .maybeSingle();
    if (bErr) throw bErr;
    if (!booking) throw new BookingError("not_found", "Booking not found");
    if (booking.status !== "pending") {
      if (booking.status === "confirmed") {
        // Idempotencia: ya estaba confirmada, devolver tal cual.
        const { data: full } = await supabase
          .from("bookings").select("*").eq("id", bookingId).single();
        return { booking: full as Booking };
      }
      throw new BookingError("not_pending", `Booking is ${booking.status}`);
    }
    if (
      booking.pending_expires_at &&
      booking.pending_expires_at < new Date().toISOString()
    ) {
      throw new BookingError("expired_pending", "Pending booking has expired");
    }

    const { data: service } = await supabase
      .from("booking_services")
      .select("buffer_before_min, buffer_after_min")
      .eq("id", booking.service_id)
      .single();
    const bufBefore = (service?.buffer_before_min ?? 0) * 60_000;
    const bufAfter = (service?.buffer_after_min ?? 0) * 60_000;
    const slotStartMs = new Date(booking.slot_start_utc).getTime();
    const slotEndMs = new Date(booking.slot_end_utc).getTime();
    const windowFrom = new Date(slotStartMs - bufBefore).toISOString();
    const windowTo = new Date(slotEndMs + bufAfter).toISOString();

    // Confirm atómico — solo si NO hay otra confirmed que solape.
    // Usamos rpc 'confirm_booking_atomic' si existiera; aquí emulamos en JS
    // con un check + update condicional + verificación post.
    const { data: conflicting } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_tenant_id", booking.booking_tenant_id)
      .neq("id", bookingId)
      .eq("status", "confirmed")
      .lt("slot_start_utc", windowTo)
      .gt("slot_end_utc", windowFrom)
      .limit(1);

    if (conflicting && conflicting.length > 0) {
      // Otro ganó la carrera. Marcamos esta pending como cancelled con motivo.
      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancelled_by: "slot_taken_by_another",
        })
        .eq("id", bookingId)
        .eq("status", "pending");
      await logAudit({
        booking_tenant_id: booking.booking_tenant_id,
        booking_id: bookingId,
        action: "booking.slot_taken_by_another",
      });
      throw new SlotTakenError(booking.slot_start_utc);
    }

    const { data: updated, error: upErr } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        pending_expires_at: null,
      })
      .eq("id", bookingId)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();
    if (upErr) throw upErr;
    if (!updated) {
      throw new BookingError("race_lost", "Booking confirmation race lost");
    }

    await logAudit({
      booking_tenant_id: updated.booking_tenant_id,
      booking_id: bookingId,
      action: "booking.confirmed",
    });

    return { booking: updated as Booking };
  },

  async cancelBooking({ rawToken, bookingId, by, reason }): Promise<ConfirmedBooking> {
    const supabase = getSupabase();

    // Cutoff: solo aplica a cancelaciones del cliente final. El operador desde
    // /admin (by='business') puede cancelar siempre, sin importar el plazo.
    if (by === "customer") {
      // Acepta ambos scopes — tokens viejos ("cancel") siguen funcionando, los nuevos son "manage".
      const r1 = await consumeToken({ signedToken: rawToken, expectedScope: "manage" });
      let resolved = r1.ok ? r1 : null;
      if (!resolved) {
        const r2 = await consumeToken({ signedToken: rawToken, expectedScope: "cancel" });
        if (r2.ok) resolved = r2;
        else throw new TokenError(r2.reason);
      }
      if (resolved.bookingId !== bookingId) throw new TokenError("not_found");

      // Cargar booking + tenant para validar cutoff. Solo bloquea cancelar fuera
      // de plazo si la reserva ya está confirmed; pending siempre cancelable.
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .select("status, slot_start_utc, booking_tenant_id")
        .eq("id", bookingId)
        .maybeSingle();
      if (bErr) throw bErr;
      if (!booking) throw new BookingError("not_found", "Booking not found");

      if (booking.status === "confirmed") {
        const { data: tenant } = await supabase
          .from("booking_tenants")
          .select("cancel_cutoff_hours")
          .eq("id", booking.booking_tenant_id)
          .single();
        if (tenant?.cancel_cutoff_hours !== null && tenant?.cancel_cutoff_hours !== undefined) {
          const cutoffMs =
            new Date(booking.slot_start_utc).getTime() -
            tenant.cancel_cutoff_hours * 60 * 60 * 1000;
          if (Date.now() > cutoffMs) {
            throw new BookingError(
              "cutoff_passed",
              `Cannot cancel less than ${tenant.cancel_cutoff_hours}h before slot`
            );
          }
        }
      }
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: by,
        cancellation_reason: reason ?? null,
      })
      .eq("id", bookingId)
      .in("status", ["pending", "confirmed"])
      .select("*")
      .single();
    if (error) throw error;
    if (!data) throw new BookingError("not_active", "Booking not active");

    await logAudit({
      booking_tenant_id: data.booking_tenant_id,
      booking_id: bookingId,
      action: "booking.cancelled",
      details: { by, reason },
    });

    return { booking: data as Booking };
  },
};

// ============================================================
// rescheduleBooking — extra del native adapter (no en interface por ahora)
// ============================================================
export interface RescheduleParams {
  bookingId: string;
  rawToken: string;
  newSlotStartUtc: string;
  newServiceId?: string;
}

export interface RescheduledBooking {
  oldBooking: Booking;
  newBooking: Booking;
}

export async function rescheduleBooking(
  params: RescheduleParams
): Promise<RescheduledBooking> {
  const supabase = getSupabase();

  // Validar token (acepta manage o cancel viejo).
  const r1 = await consumeToken({
    signedToken: params.rawToken,
    expectedScope: "manage",
  });
  let resolved = r1.ok ? r1 : null;
  if (!resolved) {
    const r2 = await consumeToken({
      signedToken: params.rawToken,
      expectedScope: "cancel",
    });
    if (r2.ok) resolved = r2;
    else throw new TokenError(r2.reason);
  }
  if (resolved.bookingId !== params.bookingId) {
    throw new TokenError("not_found");
  }

  // Cargar booking original + tenant.
  const { data: oldBooking, error: oErr } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", params.bookingId)
    .maybeSingle();
  if (oErr) throw oErr;
  if (!oldBooking) throw new BookingError("not_found", "Booking not found");
  if (!["pending", "confirmed"].includes(oldBooking.status)) {
    throw new BookingError("not_active", `Booking is ${oldBooking.status}`);
  }

  const { data: tenant } = await supabase
    .from("booking_tenants")
    .select("*")
    .eq("id", oldBooking.booking_tenant_id)
    .single();
  if (!tenant) throw new BookingError("tenant_not_found", "Tenant not found");

  // Cutoff: si oldBooking es confirmed, comprobar reschedule_cutoff_hours.
  if (
    oldBooking.status === "confirmed" &&
    tenant.reschedule_cutoff_hours !== null
  ) {
    const cutoffMs =
      new Date(oldBooking.slot_start_utc).getTime() -
      tenant.reschedule_cutoff_hours * 60 * 60 * 1000;
    if (Date.now() > cutoffMs) {
      throw new BookingError(
        "cutoff_passed",
        `Cannot reschedule less than ${tenant.reschedule_cutoff_hours}h before slot`
      );
    }
  }

  // Contador de reschedules — solo aplica a confirmed.
  if (
    oldBooking.status === "confirmed" &&
    oldBooking.reschedule_count >= tenant.max_reschedules_per_booking
  ) {
    throw new BookingError(
      "max_reschedules",
      `Reached max reschedules (${tenant.max_reschedules_per_booking})`
    );
  }

  const newServiceId = params.newServiceId ?? oldBooking.service_id;
  const { data: newService, error: sErr } = await supabase
    .from("booking_services")
    .select("id, duration_min, buffer_before_min, buffer_after_min, active")
    .eq("id", newServiceId)
    .eq("booking_tenant_id", oldBooking.booking_tenant_id)
    .maybeSingle();
  if (sErr) throw sErr;
  if (!newService || !newService.active) {
    throw new BookingError("service_not_found", "New service inactive");
  }

  const newSlotStartMs = new Date(params.newSlotStartUtc).getTime();
  const newSlotEndMs = newSlotStartMs + newService.duration_min * 60_000;
  const newSlotStartIso = new Date(newSlotStartMs).toISOString();
  const newSlotEndIso = new Date(newSlotEndMs).toISOString();

  if (newSlotStartMs < Date.now() + tenant.min_minutes_to_slot * 60_000) {
    throw new BookingError("too_close_to_slot", "Slot too close to now");
  }

  // Check de disponibilidad para el nuevo slot — ignorar la booking actual.
  const bufBefore = newService.buffer_before_min * 60_000;
  const bufAfter = newService.buffer_after_min * 60_000;
  const wFrom = new Date(newSlotStartMs - bufBefore).toISOString();
  const wTo = new Date(newSlotEndMs + bufAfter).toISOString();
  const nowIso = new Date().toISOString();
  const { data: conflicts } = await supabase
    .from("bookings")
    .select("id, status, pending_expires_at")
    .eq("booking_tenant_id", oldBooking.booking_tenant_id)
    .neq("id", params.bookingId)
    .in("status", ["pending", "confirmed"])
    .lt("slot_start_utc", wTo)
    .gt("slot_end_utc", wFrom);
  const alive = (conflicts ?? []).filter((c) => {
    if (c.status === "confirmed") return true;
    return !c.pending_expires_at || c.pending_expires_at >= nowIso;
  });
  if (alive.length > 0) {
    throw new SlotTakenError(newSlotStartIso);
  }

  // ------- Comportamiento según estado original -------
  // Caso A: oldBooking era 'pending' → reagendar manteniendo el flujo de email-confirm.
  //          Cancelar pending + crear nueva pending. Nuevo email "Confirma tu cita".
  // Caso B: oldBooking era 'confirmed' → cancelar + crear nueva confirmed directa.
  //          Nuevo email "Cita reagendada" con .ics nuevo.

  // Cancelar la anterior.
  const { error: cancelErr } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: "rescheduled",
    })
    .eq("id", oldBooking.id);
  if (cancelErr) throw cancelErr;

  const newStatus: Booking["status"] =
    oldBooking.status === "pending" ? "pending" : "confirmed";

  const pendingExpiresAt =
    newStatus === "pending"
      ? new Date(
          Math.min(
            Date.now() + tenant.pending_expires_in_minutes * 60_000,
            newSlotStartMs - 5 * 60_000
          )
        ).toISOString()
      : null;

  const newRescheduleCount =
    oldBooking.status === "confirmed"
      ? oldBooking.reschedule_count + 1
      : oldBooking.reschedule_count;

  const placeholderUid = `tmp-${crypto.randomUUID()}`;
  const { data: created, error: insErr } = await supabase
    .from("bookings")
    .insert({
      booking_tenant_id: oldBooking.booking_tenant_id,
      service_id: newService.id,
      slot_start_utc: newSlotStartIso,
      slot_end_utc: newSlotEndIso,
      status: newStatus,
      contact_name: oldBooking.contact_name,
      contact_email: oldBooking.contact_email,
      contact_phone: oldBooking.contact_phone,
      notes: oldBooking.notes,
      locale: oldBooking.locale,
      ical_uid: placeholderUid,
      replaces_booking_id: oldBooking.id,
      reschedule_count: newRescheduleCount,
      pending_expires_at: pendingExpiresAt,
      confirmed_at: newStatus === "confirmed" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();
  if (insErr) throw insErr;

  const newIcalUid = `bookings.ebecerra.es+${created.id}`;
  await supabase
    .from("bookings")
    .update({ ical_uid: newIcalUid })
    .eq("id", created.id);

  await logAudit({
    booking_tenant_id: oldBooking.booking_tenant_id,
    booking_id: oldBooking.id,
    action: "booking.rescheduled_out",
    details: { new_booking_id: created.id },
  });
  await logAudit({
    booking_tenant_id: oldBooking.booking_tenant_id,
    booking_id: created.id,
    action: "booking.rescheduled_in",
    details: { from_booking_id: oldBooking.id },
  });

  const refreshed = await supabase
    .from("bookings")
    .select("*")
    .in("id", [oldBooking.id, created.id]);
  const oldRow = refreshed.data?.find((b) => b.id === oldBooking.id) as
    | Booking
    | undefined;
  const newRow = refreshed.data?.find((b) => b.id === created.id) as
    | Booking
    | undefined;
  if (!oldRow || !newRow) throw new Error("Refresh failed");
  return { oldBooking: oldRow, newBooking: newRow };
}

// ============================================================
// Errores
// ============================================================
export class SlotTakenError extends Error {
  constructor(public slot: string) {
    super(`Slot ${slot} already taken`);
  }
}

export class TokenError extends Error {
  constructor(public reason: string) {
    super(`Token error: ${reason}`);
  }
}

export class BookingError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export function isSlotTaken(e: unknown): e is SlotTakenError {
  return e instanceof SlotTakenError;
}
export function isTokenError(e: unknown): e is TokenError {
  return e instanceof TokenError;
}
export function isBookingError(e: unknown): e is BookingError {
  return e instanceof BookingError;
}

/**
 * Available range util — devuelve un Slot[] de N días desde "now" para un servicio.
 */
export async function getNext30DaysSlots(args: {
  bookingTenantId: string;
  serviceId: string;
}): Promise<Slot[]> {
  const fromUtc = new Date().toISOString();
  const toUtc = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return nativeProvider.getAvailability({
    bookingTenantId: args.bookingTenantId,
    serviceId: args.serviceId,
    fromUtc,
    toUtc,
  });
}
