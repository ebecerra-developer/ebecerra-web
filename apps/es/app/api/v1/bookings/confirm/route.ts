import { consumeToken, issueToken } from "@ebecerra/bookings/tokens";
import { getSupabase, logAudit } from "@ebecerra/bookings/db";
import { sendConfirmedEmail } from "@ebecerra/bookings/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/bookings/confirm?token=<signed>
 *
 * Landing page tras click en el email de "confirma tu cita".
 * Sin X-Tenant-Key — el token es la auth.
 * Devuelve HTML directo (no JSON) — el usuario lo abre en su navegador.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const signedToken = url.searchParams.get("token");
  if (!signedToken) {
    return htmlError(400, "Falta el token en el enlace.");
  }

  const result = await consumeToken({
    signedToken,
    expectedScope: "confirm",
  });
  if (!result.ok) {
    return htmlError(
      result.reason === "expired" ? 410 : 400,
      reasonToMessage(result.reason)
    );
  }

  const supabase = getSupabase();
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", result.bookingId)
    .eq("status", "pending")
    .select(
      "id, slot_start_utc, slot_end_utc, contact_name, locale, booking_tenant_id, service_id"
    )
    .maybeSingle();
  if (error) throw error;
  if (!booking) {
    return htmlError(409, "Esta cita ya estaba confirmada o cancelada.");
  }

  await logAudit({
    booking_tenant_id: booking.booking_tenant_id,
    booking_id: booking.id,
    action: "booking.confirmed",
  });

  // Email de confirmación con .ics + nuevo token de cancelación válido hasta el slot.
  try {
    const cancelToken = await issueToken({
      bookingId: booking.id,
      scope: "cancel",
      expiresAt: new Date(booking.slot_start_utc),
    });
    await sendConfirmedEmail({
      bookingId: booking.id,
      cancelSignedToken: cancelToken.signed,
    });
  } catch (e) {
    console.error("[bookings/confirm] sendConfirmedEmail failed:", e);
  }

  // Tenant + servicio para el render.
  const [tenantRes, serviceRes] = await Promise.all([
    supabase
      .from("booking_tenants")
      .select("name, timezone")
      .eq("id", booking.booking_tenant_id)
      .maybeSingle(),
    supabase
      .from("booking_services")
      .select("name, duration_min")
      .eq("id", booking.service_id)
      .maybeSingle(),
  ]);

  const tenantName = tenantRes.data?.name ?? "el negocio";
  const timezone = tenantRes.data?.timezone ?? "Europe/Madrid";
  const serviceName =
    pickLocale(serviceRes.data?.name, booking.locale) ?? "tu servicio";
  const slotLocal = formatInZone(new Date(booking.slot_start_utc), timezone);

  return html(`
    <h1>Cita confirmada</h1>
    <p>Hola ${escape(booking.contact_name)},</p>
    <p>Tu cita con <strong>${escape(tenantName)}</strong> para <strong>${escape(serviceName)}</strong> está confirmada para el <strong>${escape(slotLocal)}</strong>.</p>
    <p>Te llegará un email de recordatorio 24 horas antes.</p>
  `);
}

function reasonToMessage(reason: string): string {
  switch (reason) {
    case "expired":
      return "Este enlace ha caducado.";
    case "used":
      return "Este enlace ya se ha usado.";
    case "wrong_scope":
      return "Este enlace no es válido para confirmar.";
    case "bad_signature":
    case "malformed":
      return "El enlace no es válido.";
    case "not_found":
      return "No se encontró la cita.";
    default:
      return "Enlace inválido.";
  }
}

function pickLocale(
  v: unknown,
  locale: string | undefined
): string | undefined {
  if (!v || typeof v !== "object") return undefined;
  const obj = v as Record<string, unknown>;
  const lang = locale ?? "es";
  return (typeof obj[lang] === "string" && (obj[lang] as string)) ||
    (typeof obj.es === "string" ? (obj.es as string) : undefined);
}

function formatInZone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: timezone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function html(content: string): Response {
  return new Response(layout(content), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function htmlError(status: number, message: string): Response {
  return new Response(layout(`<h1>No se pudo confirmar</h1><p>${escape(message)}</p>`), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function layout(body: string): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Reservas · ebecerra.es</title>
  <style>
    body { font: 16px/1.5 system-ui, sans-serif; max-width: 560px; margin: 4rem auto; padding: 0 1.5rem; color: #1a1a1a; }
    h1 { font-size: 1.6rem; margin-bottom: 0.5rem; color: #047857; }
    p { margin: 0.8rem 0; }
  </style>
</head>
<body>${body}</body>
</html>`;
}
