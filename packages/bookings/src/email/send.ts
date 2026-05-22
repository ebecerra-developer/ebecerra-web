import { Resend } from "resend";
import {
  buildPendingEmail,
  buildConfirmedEmail,
  buildReminderEmail,
  buildCancelledEmail,
  type BookingEmailVars,
} from "./templates";
import { buildIcs } from "./ics";
import { getSupabase } from "../db/client";
import type { Booking, BookingTenant } from "../types";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

function fromAddress(): string {
  return process.env.CONTACT_FROM_EMAIL ?? "no-reply@ebecerra.es";
}

function bookingsOrigin(): string {
  return process.env.BOOKINGS_PUBLIC_ORIGIN ?? "https://bookings.ebecerra.es";
}

type Locale = "es" | "en";

function pickLocale(v: unknown, locale: string): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    return (
      (typeof obj[locale] === "string" && (obj[locale] as string)) ||
      (typeof obj.es === "string" ? (obj.es as string) : "") ||
      ""
    );
  }
  return "";
}

function formatInZone(date: Date, timezone: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    timeZone: timezone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

interface SendContext {
  booking: Booking;
  tenant: BookingTenant;
  serviceName: string;
  durationMin: number;
}

async function loadContext(bookingId: string): Promise<SendContext> {
  const supabase = getSupabase();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();
  if (error || !booking) throw error ?? new Error("Booking not found");

  const [tenantRes, serviceRes] = await Promise.all([
    supabase
      .from("booking_tenants")
      .select("*")
      .eq("id", booking.booking_tenant_id)
      .single(),
    supabase
      .from("booking_services")
      .select("name, duration_min")
      .eq("id", booking.service_id)
      .single(),
  ]);
  if (tenantRes.error || !tenantRes.data) throw tenantRes.error;
  if (serviceRes.error || !serviceRes.data) throw serviceRes.error;

  return {
    booking: booking as Booking,
    tenant: tenantRes.data as BookingTenant,
    serviceName: pickLocale(serviceRes.data.name, booking.locale),
    durationMin: serviceRes.data.duration_min,
  };
}

function buildVars(ctx: SendContext, urls: { confirm?: string; cancel?: string }): BookingEmailVars {
  const locale = (ctx.booking.locale as Locale) ?? "es";
  return {
    tenant: ctx.tenant,
    contactName: ctx.booking.contact_name,
    serviceName: ctx.serviceName,
    durationMin: ctx.durationMin,
    slotStartLocal: formatInZone(
      new Date(ctx.booking.slot_start_utc),
      ctx.tenant.timezone,
      locale
    ),
    cancellationPolicy: pickLocale(
      ctx.tenant.cancellation_policy,
      locale
    ) || undefined,
    confirmUrl: urls.confirm,
    cancelUrl: urls.cancel,
    bookingsOrigin: bookingsOrigin(),
  };
}

/** Send "pending — please confirm" con links de confirm+cancel. */
export async function sendPendingEmail(args: {
  bookingId: string;
  confirmSignedToken: string;
  cancelSignedToken: string;
}): Promise<void> {
  const ctx = await loadContext(args.bookingId);
  const origin = bookingsOrigin();
  const confirmUrl = `${origin}/api/v1/bookings/confirm?token=${encodeURIComponent(args.confirmSignedToken)}`;
  const cancelUrl = `${origin}/api/v1/bookings/cancel?token=${encodeURIComponent(args.cancelSignedToken)}`;
  const vars = buildVars(ctx, { confirm: confirmUrl, cancel: cancelUrl });
  const locale = (ctx.booking.locale as Locale) ?? "es";
  const { subject, html, text } = buildPendingEmail(vars, locale);

  const resend = getResend();
  const { error } = await resend.emails.send(
    {
      from: `${ctx.tenant.name} <${fromAddress()}>`,
      to: [ctx.booking.contact_email],
      replyTo: ctx.tenant.contact_email,
      subject,
      html,
      text,
    },
    { idempotencyKey: `booking-pending/${args.bookingId}` }
  );
  if (error) throw new Error(`Resend pending failed: ${error.message}`);
}

/** Send "confirmed" con .ics adjunto. */
export async function sendConfirmedEmail(args: {
  bookingId: string;
  cancelSignedToken: string;
}): Promise<void> {
  const ctx = await loadContext(args.bookingId);
  const origin = bookingsOrigin();
  const cancelUrl = `${origin}/api/v1/bookings/cancel?token=${encodeURIComponent(args.cancelSignedToken)}`;
  const vars = buildVars(ctx, { cancel: cancelUrl });
  const locale = (ctx.booking.locale as Locale) ?? "es";
  const { subject, html, text } = buildConfirmedEmail(vars, locale);

  const ics = buildIcs({
    uid: ctx.booking.ical_uid,
    startUtc: new Date(ctx.booking.slot_start_utc),
    endUtc: new Date(ctx.booking.slot_end_utc),
    summary: `${ctx.serviceName} · ${ctx.tenant.name}`,
    description: ctx.booking.notes ?? undefined,
    organizerEmail: ctx.tenant.contact_email,
    organizerName: ctx.tenant.name,
    attendeeEmail: ctx.booking.contact_email,
    attendeeName: ctx.booking.contact_name,
  });

  const resend = getResend();
  const { error } = await resend.emails.send(
    {
      from: `${ctx.tenant.name} <${fromAddress()}>`,
      to: [ctx.booking.contact_email],
      replyTo: ctx.tenant.contact_email,
      subject,
      html,
      text,
      attachments: [
        {
          filename: "cita.ics",
          content: Buffer.from(ics, "utf8").toString("base64"),
          contentType: "text/calendar; method=REQUEST; charset=UTF-8",
        },
      ],
    },
    { idempotencyKey: `booking-confirmed/${args.bookingId}` }
  );
  if (error) throw new Error(`Resend confirmed failed: ${error.message}`);
}

/** Send "24h reminder". */
export async function sendReminderEmail(args: {
  bookingId: string;
  cancelSignedToken: string;
}): Promise<void> {
  const ctx = await loadContext(args.bookingId);
  const origin = bookingsOrigin();
  const cancelUrl = `${origin}/api/v1/bookings/cancel?token=${encodeURIComponent(args.cancelSignedToken)}`;
  const vars = buildVars(ctx, { cancel: cancelUrl });
  const locale = (ctx.booking.locale as Locale) ?? "es";
  const { subject, html, text } = buildReminderEmail(vars, locale);

  const resend = getResend();
  const { error } = await resend.emails.send(
    {
      from: `${ctx.tenant.name} <${fromAddress()}>`,
      to: [ctx.booking.contact_email],
      replyTo: ctx.tenant.contact_email,
      subject,
      html,
      text,
    },
    { idempotencyKey: `booking-reminder/${args.bookingId}` }
  );
  if (error) throw new Error(`Resend reminder failed: ${error.message}`);
}

/** Send "cancelled". */
export async function sendCancelledEmail(args: {
  bookingId: string;
  reason?: string;
}): Promise<void> {
  const ctx = await loadContext(args.bookingId);
  const vars = buildVars(ctx, {});
  vars.cancellationReason = args.reason;
  const locale = (ctx.booking.locale as Locale) ?? "es";
  const { subject, html, text } = buildCancelledEmail(vars, locale);

  const resend = getResend();
  const { error } = await resend.emails.send(
    {
      from: `${ctx.tenant.name} <${fromAddress()}>`,
      to: [ctx.booking.contact_email],
      replyTo: ctx.tenant.contact_email,
      subject,
      html,
      text,
    },
    { idempotencyKey: `booking-cancelled/${args.bookingId}/${ctx.booking.cancelled_at ?? "now"}` }
  );
  if (error) throw new Error(`Resend cancelled failed: ${error.message}`);
}
