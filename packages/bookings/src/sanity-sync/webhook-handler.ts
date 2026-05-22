import {
  findBookingTenantBySanityDoc,
  findBookingTenantById,
  upsertBookingTenantFromSanity,
  upsertServiceFromSanity,
  logAudit,
} from "../db";
import type { LocaleString } from "../types";

/**
 * Payload de webhook Sanity para reservas. Esperamos doc completo (sin proyección custom).
 *
 * Filtro recomendado en Sanity:
 *   _type in ["bookingTenantConfig", "bookingService"]
 * Trigger: on publish.
 * Auth: signed con BOOKINGS_WEBHOOK_SECRET.
 */
type SanityBookingPayload = {
  _id: string;
  _type: "bookingTenantConfig" | "bookingService" | string;
  _rev?: string;
  [key: string]: unknown;
};

export type SyncResult =
  | { ok: true; bookingTenantId: string; action: "tenant.synced" | "service.synced" }
  | { ok: false; reason: string };

export async function handleBookingsSyncWebhook(args: {
  sanityProjectId: string;
  payload: SanityBookingPayload;
}): Promise<SyncResult> {
  const { payload, sanityProjectId } = args;

  if (payload._type === "bookingTenantConfig") {
    return await syncTenant({ sanityProjectId, payload });
  }
  if (payload._type === "bookingService") {
    return await syncService({ sanityProjectId, payload });
  }
  return { ok: false, reason: `Unsupported _type: ${payload._type}` };
}

async function syncTenant(args: {
  sanityProjectId: string;
  payload: SanityBookingPayload;
}): Promise<SyncResult> {
  const tenant = await findBookingTenantBySanityDoc({
    sanityProjectId: args.sanityProjectId,
    documentId: args.payload._id,
  });
  if (!tenant) {
    return {
      ok: false,
      reason: `No booking_tenant matched sanity_project_id=${args.sanityProjectId} _id=${args.payload._id}. Provisiona el tenant en /admin antes de publicar.`,
    };
  }

  const raw = args.payload as Record<string, unknown>;
  const slug = pickSlug(raw["slug"]);
  const name = (raw["name"] as string) ?? tenant.name;
  const timezone = (raw["timezone"] as string) ?? tenant.timezone;
  const currency = (raw["currency"] as string) ?? tenant.currency;
  const default_locale = (raw["defaultLocale"] as string) ?? tenant.default_locale;
  const requires_approval = Boolean(raw["requiresApproval"]);
  const cancellation_policy = pickLocaleObject(raw["cancellationPolicy"]);
  const contact_email = (raw["contactEmail"] as string) ?? tenant.contact_email;
  const branding_logo_url = (raw["brandingLogoUrl"] as string | null) ?? null;
  const branding_color_primary =
    (raw["brandingColorPrimary"] as string | null) ?? null;
  const allowed_origins = Array.isArray(raw["allowedOrigins"])
    ? (raw["allowedOrigins"] as string[])
    : [];
  const reminder_hours_before =
    typeof raw["reminderHoursBefore"] === "number"
      ? (raw["reminderHoursBefore"] as number)
      : tenant.reminder_hours_before;

  const weeklyScheduleRaw = Array.isArray(raw["weeklySchedule"])
    ? (raw["weeklySchedule"] as Array<Record<string, unknown>>)
    : [];
  const weeklySchedule = weeklyScheduleRaw
    .map((w) => ({
      weekday: typeof w.weekday === "number" ? w.weekday : -1,
      start_time: normalizeTime(w.startTime),
      end_time: normalizeTime(w.endTime),
    }))
    .filter(
      (w) => w.weekday >= 0 && w.weekday <= 6 && w.start_time && w.end_time
    ) as Array<{ weekday: number; start_time: string; end_time: string }>;

  const overridesRaw = Array.isArray(raw["availabilityOverrides"])
    ? (raw["availabilityOverrides"] as Array<Record<string, unknown>>)
    : [];
  const availabilityOverrides = overridesRaw
    .map((o) => ({
      override_date: typeof o.overrideDate === "string" ? o.overrideDate : null,
      kind: o.kind === "extra" ? "extra" : "closed",
      start_time: normalizeTime(o.startTime),
      end_time: normalizeTime(o.endTime),
      reason: (o.reason as string | null) ?? null,
    }))
    .filter((o) => o.override_date) as Array<{
    override_date: string;
    kind: "closed" | "extra";
    start_time: string | null;
    end_time: string | null;
    reason: string | null;
  }>;

  await upsertBookingTenantFromSanity({
    bookingTenantId: tenant.id,
    patch: {
      slug: slug ?? tenant.slug,
      name,
      timezone,
      currency,
      default_locale,
      requires_approval,
      cancellation_policy,
      contact_email,
      branding_logo_url,
      branding_color_primary,
      allowed_origins,
      reminder_hours_before,
    },
    weeklySchedule,
    availabilityOverrides,
  });

  await logAudit({
    booking_tenant_id: tenant.id,
    action: "config.synced",
    details: {
      sanity_doc_id: args.payload._id,
      rev: args.payload._rev,
      weekly_count: weeklySchedule.length,
      override_count: availabilityOverrides.length,
    },
  });

  return { ok: true, bookingTenantId: tenant.id, action: "tenant.synced" };
}

async function syncService(args: {
  sanityProjectId: string;
  payload: SanityBookingPayload;
}): Promise<SyncResult> {
  const raw = args.payload as Record<string, unknown>;
  const tenantRef = (raw["tenant"] as { _ref?: string } | undefined)?._ref;
  if (!tenantRef) {
    return { ok: false, reason: `Service ${args.payload._id} has no tenant ref` };
  }

  const tenant = await findBookingTenantBySanityDoc({
    sanityProjectId: args.sanityProjectId,
    documentId: tenantRef,
  });
  if (!tenant) {
    return {
      ok: false,
      reason: `Service ${args.payload._id} references unknown tenant doc ${tenantRef}`,
    };
  }

  const name = pickLocaleObject(raw["name"]);
  const description = pickLocaleObject(raw["description"]);
  const duration_min = typeof raw["durationMin"] === "number" ? (raw["durationMin"] as number) : 0;
  if (duration_min <= 0) {
    return { ok: false, reason: `Service ${args.payload._id} has invalid duration` };
  }

  await upsertServiceFromSanity({
    booking_tenant_id: tenant.id,
    sanity_document_id: args.payload._id,
    name: name as LocaleString,
    description,
    duration_min,
    buffer_before_min:
      typeof raw["bufferBeforeMin"] === "number" ? (raw["bufferBeforeMin"] as number) : 0,
    buffer_after_min:
      typeof raw["bufferAfterMin"] === "number" ? (raw["bufferAfterMin"] as number) : 0,
    price_cents:
      typeof raw["priceCents"] === "number" ? (raw["priceCents"] as number) : null,
    currency: (raw["currency"] as string) ?? tenant.currency,
    color: (raw["color"] as string | null) ?? null,
    active: raw["active"] !== false,
    sort_order: typeof raw["sortOrder"] === "number" ? (raw["sortOrder"] as number) : 0,
    source_revision: args.payload._rev ?? null,
  });

  await logAudit({
    booking_tenant_id: tenant.id,
    action: "service.synced",
    details: {
      sanity_doc_id: args.payload._id,
      rev: args.payload._rev,
    },
  });

  return { ok: true, bookingTenantId: tenant.id, action: "service.synced" };
}

function pickSlug(v: unknown): string | null {
  if (!v || typeof v !== "object") return null;
  const current = (v as { current?: unknown }).current;
  return typeof current === "string" ? current : null;
}

function pickLocaleObject(v: unknown): LocaleString {
  if (!v || typeof v !== "object") return { es: "" };
  const obj = v as Record<string, unknown>;
  return {
    es: typeof obj.es === "string" ? obj.es : "",
    en: typeof obj.en === "string" ? (obj.en as string) : undefined,
  };
}

function normalizeTime(v: unknown): string | null {
  if (typeof v !== "string") return null;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? `${v}:00` : null;
}

// Re-export para que apps/es no necesite tocar findBookingTenantById desde fuera de db/
export { findBookingTenantById };
