import { notFound } from "next/navigation";
import { createHash } from "node:crypto";
import { getSupabase } from "@ebecerra/bookings/db";
import CitaActions from "./CitaActions";
import "./cita.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Página /cita/{bookingId}?token=<signed-manage>
 *
 * Servida en bookings.ebecerra.es. Punto de entrada para el cliente desde el
 * email "Gestionar cita". Valida el token sin consumirlo y renderiza acciones
 * según el estado de la reserva.
 *
 * El componente cliente CitaActions ejecuta las acciones (cancel/confirm via server
 * actions, reschedule embebiendo el BookingFlow).
 */
export default async function CitaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const signedToken = sp.token;

  if (!signedToken) {
    return errorPage(
      "Enlace incompleto",
      "Falta el token en el enlace. Vuelve al email original."
    );
  }

  // Valida token sin consumirlo (lookup por hash, comprueba scope + expiración).
  const parts = signedToken.split(".");
  if (parts.length !== 2) {
    return errorPage("Enlace inválido", "El formato del enlace no es válido.");
  }
  const raw = parts[0];
  const hash = createHash("sha256").update(raw).digest("hex");

  const supabase = getSupabase();
  const { data: tokenRow } = await supabase
    .from("booking_tokens")
    .select("booking_id, scope, expires_at, used_at")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!tokenRow) {
    return errorPage("Enlace inválido", "No encontramos esta cita.");
  }
  if (tokenRow.booking_id !== id) {
    return errorPage("Enlace inválido", "El token no corresponde a esta cita.");
  }
  if (tokenRow.scope !== "manage" && tokenRow.scope !== "cancel") {
    return errorPage("Enlace inválido", "Este enlace no sirve para gestionar.");
  }
  if (tokenRow.used_at) {
    return errorPage(
      "Enlace ya usado",
      "Este enlace ya se usó. Si has reagendado, revisa el último email que te enviamos."
    );
  }
  if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return errorPage("Enlace caducado", "Este enlace ya no es válido.");
  }

  // Cargar booking + tenant + servicio.
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!booking) notFound();

  const { data: tenant } = await supabase
    .from("booking_tenants")
    .select("*")
    .eq("id", booking.booking_tenant_id)
    .single();
  if (!tenant) notFound();

  const { data: service } = await supabase
    .from("booking_services")
    .select("id, name, duration_min, price_cents, currency")
    .eq("id", booking.service_id)
    .single();

  const locale: "es" | "en" = booking.locale === "en" ? "en" : "es";
  const tz = tenant.timezone;
  const slotLocal = new Intl.DateTimeFormat(
    locale === "en" ? "en-GB" : "es-ES",
    { timeZone: tz, dateStyle: "full", timeStyle: "short" }
  ).format(new Date(booking.slot_start_utc));

  const serviceName = pickLocale(service?.name, locale) ?? "?";

  // Calcula si los cutoffs permiten cada acción.
  const slotStartMs = new Date(booking.slot_start_utc).getTime();
  const hoursToSlot = (slotStartMs - Date.now()) / (60 * 60 * 1000);
  const cancelCutoff = tenant.cancel_cutoff_hours;
  const reschedCutoff = tenant.reschedule_cutoff_hours;
  const canCancel =
    cancelCutoff === null ? true : hoursToSlot >= cancelCutoff;
  const canReschedule =
    reschedCutoff === null
      ? true
      : hoursToSlot >= reschedCutoff &&
        booking.reschedule_count < tenant.max_reschedules_per_booking;

  return (
    <main className="cita-root">
      <header className="cita-header">
        <p className="cita-tenant">{tenant.name}</p>
        <h1>
          {locale === "en" ? "Manage your booking" : "Gestionar tu cita"}
        </h1>
      </header>

      <section className="cita-card">
        <h2 className="cita-card-title">{serviceName}</h2>
        <p className="cita-card-meta">
          {locale === "en" ? "Duration" : "Duración"}:{" "}
          <strong>{service?.duration_min} min</strong>
        </p>
        <p className="cita-card-meta">
          {locale === "en" ? "Date & time" : "Fecha y hora"}:{" "}
          <strong>{slotLocal}</strong>
        </p>
        <p className="cita-card-meta">
          {locale === "en" ? "Booking for" : "A nombre de"}:{" "}
          <strong>{booking.contact_name}</strong>
        </p>
        <p className="cita-card-status">
          {locale === "en" ? "Status" : "Estado"}:{" "}
          <span className={`cita-status-pill cita-status-${booking.status}`}>
            {statusLabel(booking.status, locale)}
          </span>
        </p>
      </section>

      {(booking.status === "pending" || booking.status === "confirmed") && (
        <CitaActions
          bookingId={booking.id}
          rawToken={signedToken}
          status={booking.status}
          locale={locale}
          tenantContactPhone={tenant.contact_phone}
          canCancel={canCancel}
          canReschedule={canReschedule}
          cancelCutoffHours={cancelCutoff}
          rescheduleCutoffHours={reschedCutoff}
          remainingReschedules={
            tenant.max_reschedules_per_booking - booking.reschedule_count
          }
          tenantSlug={tenant.slug}
          tenantTimezone={tz}
          currentServiceId={booking.service_id}
          bookingsApiBase={process.env.BOOKINGS_PUBLIC_ORIGIN ?? ""}
          tenantBrandColor={tenant.branding_color_primary}
        />
      )}

      {booking.status === "cancelled" && (
        <FinalState
          locale={locale}
          title={
            booking.cancelled_by === "rescheduled"
              ? locale === "en"
                ? "Booking moved"
                : "Cita reagendada"
              : locale === "en"
              ? "Booking cancelled"
              : "Cita cancelada"
          }
          body={
            booking.cancelled_by === "rescheduled"
              ? locale === "en"
                ? "This booking was replaced by a newer one. Check your latest email."
                : "Esta cita fue reemplazada por otra. Revisa el email más reciente."
              : locale === "en"
              ? "This booking has been cancelled."
              : "Esta cita está cancelada."
          }
          rebookUrl={`${process.env.BOOKINGS_PUBLIC_ORIGIN ?? ""}/reservas`}
        />
      )}

      {(booking.status === "completed" || booking.status === "no_show") && (
        <FinalState
          locale={locale}
          title={
            locale === "en" ? "Past appointment" : "Cita pasada"
          }
          body={
            locale === "en"
              ? "This appointment has already passed."
              : "Esta cita ya ha tenido lugar."
          }
          rebookUrl={`${process.env.BOOKINGS_PUBLIC_ORIGIN ?? ""}/reservas`}
        />
      )}
    </main>
  );
}

function FinalState({
  locale,
  title,
  body,
  rebookUrl,
}: {
  locale: "es" | "en";
  title: string;
  body: string;
  rebookUrl: string;
}) {
  return (
    <section className="cita-final">
      <h2>{title}</h2>
      <p>{body}</p>
      <a href={rebookUrl} className="cita-cta">
        {locale === "en" ? "Book another" : "Reservar otra cita"}
      </a>
    </section>
  );
}

function statusLabel(status: string, locale: "es" | "en"): string {
  const map: Record<string, { es: string; en: string }> = {
    pending: { es: "Pendiente de confirmar", en: "Pending confirmation" },
    confirmed: { es: "Confirmada", en: "Confirmed" },
    cancelled: { es: "Cancelada", en: "Cancelled" },
    completed: { es: "Completada", en: "Completed" },
    no_show: { es: "No se presentó", en: "No-show" },
  };
  return map[status]?.[locale] ?? status;
}

function pickLocale(v: unknown, locale: "es" | "en"): string | null {
  if (!v || typeof v !== "object") return null;
  const obj = v as Record<string, unknown>;
  const val = obj[locale] ?? obj.es;
  return typeof val === "string" ? val : null;
}

function errorPage(title: string, body: string) {
  return (
    <main className="cita-root">
      <header className="cita-header">
        <h1>{title}</h1>
        <p>{body}</p>
      </header>
    </main>
  );
}
