import {
  nativeProvider,
  isSlotTaken,
  isBookingError,
  isTokenError,
} from "@ebecerra/bookings/adapters/native";
import { issueToken } from "@ebecerra/bookings/tokens";
import { getSupabase } from "@ebecerra/bookings/db";
import {
  sendConfirmedEmail,
  sendSlotTakenEmail,
} from "@ebecerra/bookings/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/bookings/confirm?token=<signed>
 *
 * Landing page tras click en el email de "confirma tu cita".
 * Sin X-Tenant-Key — el token es la auth.
 *
 * Confirma de forma atómica vía nativeProvider — si otra reserva ya está
 * confirmada para el mismo slot, marca esta como `slot_taken_by_another` y
 * muestra mensaje adecuado.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const signedToken = url.searchParams.get("token");
  if (!signedToken) return htmlError(400, "Falta el token en el enlace.");

  // Necesitamos saber el bookingId antes de llamar a confirmBooking.
  // El token está firmado; resolvemos vía el endpoint by-token.
  const bookingId = await resolveBookingIdFromConfirmToken(signedToken);
  if (!bookingId) {
    return htmlError(400, "Enlace inválido o ya usado.");
  }

  try {
    const { booking } = await nativeProvider.confirmBooking({
      rawToken: signedToken,
      bookingId,
    });

    // Email de confirmación con .ics + nuevo manage token (válido hasta slot).
    try {
      const mng = await issueToken({
        bookingId: booking.id,
        scope: "manage",
        expiresAt: new Date(booking.slot_start_utc),
      });
      await sendConfirmedEmail({
        bookingId: booking.id,
        manageSignedToken: mng.signed,
      });
    } catch (e) {
      console.error("[bookings/confirm] sendConfirmedEmail failed:", e);
    }

    const slotLocal = await formatSlotForBooking(booking.id);
    return html(`
      <h1>Cita confirmada</h1>
      <p>Hola ${escape(booking.contact_name)},</p>
      <p>Tu cita está confirmada para el <strong>${escape(slotLocal)}</strong>.</p>
      <p>Te llegará un email de recordatorio antes de la cita.</p>
    `);
  } catch (e) {
    if (isSlotTaken(e)) {
      try {
        await sendSlotTakenEmail({ bookingId });
      } catch (mailErr) {
        console.error("[bookings/confirm] sendSlotTakenEmail failed:", mailErr);
      }
      return htmlError(
        409,
        "Lo sentimos, alguien acaba de quedarse con esa hora justo antes que tú. Te hemos enviado un email para que puedas elegir otra."
      );
    }
    if (isTokenError(e)) {
      return htmlError(400, tokenErrorMessage(e.reason));
    }
    if (isBookingError(e)) {
      if (e.code === "expired_pending") {
        return htmlError(
          410,
          "Tu reserva caducó porque no la confirmaste a tiempo. Reserva de nuevo si quieres."
        );
      }
      if (e.code === "not_pending") {
        return htmlError(409, "Esta cita ya estaba confirmada o cancelada.");
      }
      return htmlError(400, e.message);
    }
    console.error("[bookings/confirm] unexpected:", e);
    return htmlError(500, "Algo ha fallado. Inténtalo de nuevo en unos minutos.");
  }
}

async function resolveBookingIdFromConfirmToken(
  signedToken: string
): Promise<string | null> {
  // Hashea raw para buscar el token sin consumirlo.
  const { createHash } = await import("node:crypto");
  const parts = signedToken.split(".");
  if (parts.length !== 2) return null;
  const raw = parts[0];
  const hash = createHash("sha256").update(raw).digest("hex");
  const supabase = getSupabase();
  const { data } = await supabase
    .from("booking_tokens")
    .select("booking_id, scope")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!data || data.scope !== "confirm") return null;
  return data.booking_id;
}

async function formatSlotForBooking(bookingId: string): Promise<string> {
  const supabase = getSupabase();
  const { data: b } = await supabase
    .from("bookings")
    .select("slot_start_utc, booking_tenant_id")
    .eq("id", bookingId)
    .single();
  if (!b) return "";
  const { data: t } = await supabase
    .from("booking_tenants")
    .select("timezone")
    .eq("id", b.booking_tenant_id)
    .single();
  const tz = t?.timezone ?? "Europe/Madrid";
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: tz,
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(b.slot_start_utc));
}

function tokenErrorMessage(reason: string): string {
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
  return new Response(
    layout(`<h1>No se pudo confirmar</h1><p>${escape(message)}</p>`),
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
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
