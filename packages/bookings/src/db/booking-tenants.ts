import { getSupabase } from "./client";
import type { BookingTenant } from "../types";

export async function findBookingTenantById(
  id: string
): Promise<BookingTenant | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("booking_tenants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as BookingTenant) ?? null;
}

/**
 * Resuelve un booking_tenant a partir del documento de Sanity publicado.
 * Match exclusivamente por documentId (los tenants se provisionan con el _id
 * del documento Sanity en sanity_document_id).
 */
export async function findBookingTenantBySanityDoc(args: {
  sanityProjectId: string;
  documentId: string;
}): Promise<BookingTenant | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("booking_tenants")
    .select("*")
    .eq("sanity_project_id", args.sanityProjectId)
    .eq("sanity_document_id", args.documentId)
    .maybeSingle();
  if (error) throw error;
  return (data as BookingTenant) ?? null;
}

type WeeklyScheduleInput = { weekday: number; start_time: string; end_time: string };
type AvailabilityOverrideInput = {
  override_date: string;
  kind: "closed" | "extra";
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

/**
 * Upsert atómico del tenant + reemplazo de sus tablas hijas
 * (weekly_schedules, availability_overrides) con los arrays del doc Sanity.
 */
export async function upsertBookingTenantFromSanity(args: {
  bookingTenantId: string;
  patch: Partial<{
    slug: string;
    name: string;
    timezone: string;
    currency: string;
    default_locale: string;
    requires_approval: boolean;
    cancellation_policy: Record<string, string>;
    contact_email: string;
    branding_logo_url: string | null;
    branding_color_primary: string | null;
    allowed_origins: string[];
    reminder_hours_before: number;
  }>;
  weeklySchedule: WeeklyScheduleInput[];
  availabilityOverrides: AvailabilityOverrideInput[];
}): Promise<void> {
  const supabase = getSupabase();

  const { error: updErr } = await supabase
    .from("booking_tenants")
    .update(args.patch)
    .eq("id", args.bookingTenantId);
  if (updErr) throw updErr;

  // Reemplaza tabla hija: delete-all + insert-all dentro de la misma operación lógica.
  // No es atómico transaccionalmente desde Supabase JS SDK, pero el webhook es idempotente
  // por source_revision en el caller, así que un retry deja el estado correcto.
  const { error: delWeeklyErr } = await supabase
    .from("booking_weekly_schedules")
    .delete()
    .eq("booking_tenant_id", args.bookingTenantId);
  if (delWeeklyErr) throw delWeeklyErr;

  if (args.weeklySchedule.length > 0) {
    const { error: insWeeklyErr } = await supabase
      .from("booking_weekly_schedules")
      .insert(
        args.weeklySchedule.map((w) => ({
          booking_tenant_id: args.bookingTenantId,
          weekday: w.weekday,
          start_time: w.start_time,
          end_time: w.end_time,
        }))
      );
    if (insWeeklyErr) throw insWeeklyErr;
  }

  const { error: delOvErr } = await supabase
    .from("booking_availability_overrides")
    .delete()
    .eq("booking_tenant_id", args.bookingTenantId);
  if (delOvErr) throw delOvErr;

  if (args.availabilityOverrides.length > 0) {
    const { error: insOvErr } = await supabase
      .from("booking_availability_overrides")
      .insert(
        args.availabilityOverrides.map((o) => ({
          booking_tenant_id: args.bookingTenantId,
          override_date: o.override_date,
          kind: o.kind,
          start_time: o.start_time,
          end_time: o.end_time,
          reason: o.reason,
        }))
      );
    if (insOvErr) throw insOvErr;
  }
}
