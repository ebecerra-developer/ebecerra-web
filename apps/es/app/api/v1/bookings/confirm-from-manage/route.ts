import {
  nativeProvider,
  isSlotTaken,
  isBookingError,
  isTokenError,
} from "@ebecerra/bookings/adapters/native";
import { issueToken } from "@ebecerra/bookings/tokens";
import {
  sendConfirmedEmail,
  sendSlotTakenEmail,
} from "@ebecerra/bookings/email";
import { corsPreflight } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req: Request): Promise<Response> {
  return corsPreflight(req);
}

/**
 * POST /api/v1/bookings/confirm-from-manage
 * Body: { token, booking_id }
 *
 * Permite confirmar una reserva pending usando su manage token (no el confirm
 * token original). Útil cuando el cliente entra en /cita/{id} antes de confirmar.
 *
 * Devuelve { ok: true, redirect_to: "/cita/{id}?token=NEW_MANAGE" } para que la
 * página redirija al nuevo estado.
 */
export async function POST(request: Request): Promise<Response> {
  let body: { token?: string; booking_id?: string } = {};
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }
  if (!body.token || !body.booking_id) {
    return jsonError(400, "missing_fields", "token, booking_id required");
  }

  try {
    const { booking } = await nativeProvider.confirmBooking({
      rawToken: body.token,
      bookingId: body.booking_id,
      tokenScope: "manage",
    });

    // Emitir nuevo manage token para redirigir al /cita/{id} con un token vivo.
    const mng = await issueToken({
      bookingId: booking.id,
      scope: "manage",
      expiresAt: new Date(booking.slot_start_utc),
    });

    try {
      await sendConfirmedEmail({
        bookingId: booking.id,
        manageSignedToken: mng.signed,
      });
    } catch (e) {
      console.error("[confirm-from-manage] sendConfirmedEmail failed:", e);
    }

    const origin = process.env.BOOKINGS_PUBLIC_ORIGIN ?? "";
    return Response.json({
      ok: true,
      redirect_to: `${origin}/cita/${booking.id}?token=${encodeURIComponent(mng.signed)}`,
    });
  } catch (e) {
    if (isSlotTaken(e)) {
      try {
        await sendSlotTakenEmail({ bookingId: body.booking_id });
      } catch {}
      return jsonError(
        409,
        "slot_taken_by_another",
        "Alguien acaba de quedarse con esa hora justo antes que tú. Te hemos enviado un email para reservar otra."
      );
    }
    if (isTokenError(e)) {
      return jsonError(400, e.reason, "Token inválido o ya usado");
    }
    if (isBookingError(e)) {
      return jsonError(400, e.code, e.message);
    }
    console.error("[confirm-from-manage]", e);
    return jsonError(500, "internal", "Error interno");
  }
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(
    JSON.stringify({ ok: false, error: { code, message } }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}
