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

    // Tenant + service + weekly + overrides + occupied bookings en paralelo.
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
        supabase
          .from("bookings")
          .select("slot_start_utc, slot_end_utc")
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

    return calculateSlots({
      timezone: tenantRes.data.timezone,
      fromUtc: new Date(fromUtc),
      toUtc: new Date(toUtc),
      durationMin: serviceRes.data.duration_min,
      bufferBeforeMin: serviceRes.data.buffer_before_min,
      bufferAfterMin: serviceRes.data.buffer_after_min,
      weeklySchedule: weeklyRes.data ?? [],
      overrides: overridesRes.data ?? [],
      occupied: (occupiedRes.data ?? []).map((o) => ({
        start_utc: o.slot_start_utc,
        end_utc: o.slot_end_utc,
      })),
    });
  },

  async createBooking(params: CreateBookingParams): Promise<CreatedBooking> {
    const supabase = getSupabase();

    // 1. Validar servicio + tenant + obtener duración.
    const { data: service, error: svcErr } = await supabase
      .from("booking_services")
      .select(
        "id, duration_min, buffer_before_min, buffer_after_min, active, booking_tenant_id"
      )
      .eq("id", params.serviceId)
      .eq("booking_tenant_id", params.bookingTenantId)
      .maybeSingle();
    if (svcErr) throw svcErr;
    if (!service || !service.active) {
      throw new Error("Service not found or inactive");
    }

    const slotStartMs = new Date(params.slotStartUtc).getTime();
    if (!Number.isFinite(slotStartMs)) throw new Error("Invalid slot_start_utc");
    if (slotStartMs < Date.now()) throw new Error("Slot is in the past");

    const slotEndMs = slotStartMs + service.duration_min * 60_000;
    const slotEndUtc = new Date(slotEndMs).toISOString();
    const slotStartIso = new Date(slotStartMs).toISOString();

    // 2. Re-check de disponibilidad: ¿hay alguna reserva pending/confirmed que solape?
    //    Incluyendo buffers del servicio.
    const bufBefore = service.buffer_before_min * 60_000;
    const bufAfter = service.buffer_after_min * 60_000;
    const windowFrom = new Date(slotStartMs - bufBefore).toISOString();
    const windowTo = new Date(slotEndMs + bufAfter).toISOString();

    const { data: conflicts, error: confErr } = await supabase
      .from("bookings")
      .select("id, slot_start_utc, slot_end_utc")
      .eq("booking_tenant_id", params.bookingTenantId)
      .in("status", ["pending", "confirmed"])
      .lt("slot_start_utc", windowTo)
      .gt("slot_end_utc", windowFrom);
    if (confErr) throw confErr;
    if (conflicts && conflicts.length > 0) {
      throw new SlotTakenError(slotStartIso);
    }

    // 3. Insert booking. ical_uid se genera con el id devuelto.
    const tenant = await supabase
      .from("booking_tenants")
      .select("requires_approval")
      .eq("id", params.bookingTenantId)
      .maybeSingle();
    const initialStatus: Booking["status"] = "pending"; // siempre pending hasta confirmar email
    const placeholderUid = `tmp-${crypto.randomUUID()}`;

    const { data: created, error: insErr } = await supabase
      .from("bookings")
      .insert({
        booking_tenant_id: params.bookingTenantId,
        service_id: service.id,
        slot_start_utc: slotStartIso,
        slot_end_utc: slotEndUtc,
        status: initialStatus,
        contact_name: params.contact.name,
        contact_email: params.contact.email,
        contact_phone: params.contact.phone ?? null,
        notes: params.contact.notes ?? null,
        locale: params.locale ?? "es",
        ical_uid: placeholderUid,
      })
      .select("id, slot_start_utc, slot_end_utc, status")
      .single();
    if (insErr) throw insErr;
    if (!created) throw new Error("Insert failed");

    // 4. Actualizar ical_uid con el id real (estable, único, RFC 5545 friendly).
    const icalUid = `bookings.ebecerra.es+${created.id}`;
    const { error: updErr } = await supabase
      .from("bookings")
      .update({ ical_uid: icalUid })
      .eq("id", created.id);
    if (updErr) throw updErr;

    // 5. Emitir tokens. Confirm vence en 7 días. Cancel vence al inicio del slot.
    const confirmExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const cancelExp = new Date(slotStartMs);
    const [confirm, cancel] = await Promise.all([
      issueToken({ bookingId: created.id, scope: "confirm", expiresAt: confirmExp }),
      issueToken({ bookingId: created.id, scope: "cancel", expiresAt: cancelExp }),
    ]);

    await logAudit({
      booking_tenant_id: params.bookingTenantId,
      booking_id: created.id,
      action: "booking.created",
      details: { slot_start_utc: slotStartIso, requires_approval: !!tenant.data?.requires_approval },
    });

    return {
      bookingId: created.id,
      slotStartUtc: created.slot_start_utc,
      slotEndUtc: created.slot_end_utc,
      confirmToken: confirm.signed,
      cancelToken: cancel.signed,
      status: created.status as Booking["status"],
    };
  },

  async confirmBooking({ rawToken, bookingId }): Promise<ConfirmedBooking> {
    const result = await consumeToken({
      signedToken: rawToken,
      expectedScope: "confirm",
    });
    if (!result.ok) throw new TokenError(result.reason);
    if (result.bookingId !== bookingId) {
      throw new TokenError("not_found");
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("status", "pending")
      .select("*")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Booking not pending");

    await logAudit({
      booking_tenant_id: data.booking_tenant_id,
      booking_id: bookingId,
      action: "booking.confirmed",
    });

    return { booking: data as Booking };
  },

  async cancelBooking({ rawToken, bookingId, by, reason }): Promise<ConfirmedBooking> {
    // Si by === 'business' no se usa rawToken — esa llamada va por server action del /admin.
    if (by === "customer") {
      const result = await consumeToken({
        signedToken: rawToken,
        expectedScope: "cancel",
      });
      if (!result.ok) throw new TokenError(result.reason);
      if (result.bookingId !== bookingId) {
        throw new TokenError("not_found");
      }
    }

    const supabase = getSupabase();
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
    if (!data) throw new Error("Booking not active");

    await logAudit({
      booking_tenant_id: data.booking_tenant_id,
      booking_id: bookingId,
      action: "booking.cancelled",
      details: { by, reason },
    });

    return { booking: data as Booking };
  },
};

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

export function isSlotTaken(e: unknown): e is SlotTakenError {
  return e instanceof SlotTakenError;
}
export function isTokenError(e: unknown): e is TokenError {
  return e instanceof TokenError;
}

/**
 * Available range util — devuelve un Slot[] de N días desde "now" para un servicio.
 * Útil para previews y endpoints públicos.
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
