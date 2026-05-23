import {
  rescheduleBooking,
  isSlotTaken,
  isBookingError,
  isTokenError,
} from "@ebecerra/bookings/adapters/native";
import { issueToken } from "@ebecerra/bookings/tokens";
import { sendRescheduledEmail, sendPendingEmail } from "@ebecerra/bookings/email";
import { corsPreflight } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req: Request): Promise<Response> {
  return corsPreflight(req);
}

/**
 * POST /api/v1/bookings/reschedule
 * Body: { token, booking_id, new_slot_start_utc, new_service_id? }
 *
 * Cancela la reserva original y crea una nueva. Devuelve el id + nuevo manage
 * token para que el frontend redirija a /cita/{newId}?token=...
 */
export async function POST(request: Request): Promise<Response> {
  let body: {
    token?: string;
    booking_id?: string;
    new_slot_start_utc?: string;
    new_service_id?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }
  if (!body.token || !body.booking_id || !body.new_slot_start_utc) {
    return jsonError(
      400,
      "missing_fields",
      "token, booking_id, new_slot_start_utc required"
    );
  }

  try {
    const { newBooking } = await rescheduleBooking({
      bookingId: body.booking_id,
      rawToken: body.token,
      newSlotStartUtc: body.new_slot_start_utc,
      newServiceId: body.new_service_id,
    });

    // Nuevo manage token para la nueva reserva.
    const mng = await issueToken({
      bookingId: newBooking.id,
      scope: "manage",
      expiresAt: new Date(newBooking.slot_start_utc),
    });

    // Email según estado de la nueva (pending o confirmed):
    try {
      if (newBooking.status === "pending") {
        // Si la antigua era pending, la nueva también lo es → email de confirmar.
        const confirmTok = await issueToken({
          bookingId: newBooking.id,
          scope: "confirm",
          expiresAt: new Date(
            newBooking.pending_expires_at ?? newBooking.slot_start_utc
          ),
        });
        await sendPendingEmail({
          bookingId: newBooking.id,
          confirmSignedToken: confirmTok.signed,
          manageSignedToken: mng.signed,
        });
      } else {
        await sendRescheduledEmail({
          bookingId: newBooking.id,
          manageSignedToken: mng.signed,
        });
      }
    } catch (e) {
      console.error("[reschedule] email failed:", e);
    }

    const origin = process.env.BOOKINGS_PUBLIC_ORIGIN ?? "";
    return Response.json({
      ok: true,
      new_booking_id: newBooking.id,
      new_manage_token: mng.signed,
      redirect_to: `${origin}/cita/${newBooking.id}?token=${encodeURIComponent(mng.signed)}`,
    });
  } catch (e) {
    if (isSlotTaken(e)) {
      return jsonError(409, "slot_taken", "Ese hueco ya está ocupado.");
    }
    if (isTokenError(e)) {
      return jsonError(400, e.reason, "Token inválido o ya usado");
    }
    if (isBookingError(e)) {
      return jsonError(400, e.code, e.message);
    }
    console.error("[reschedule]", e);
    return jsonError(500, "internal", "Error interno");
  }
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(
    JSON.stringify({ ok: false, error: { code, message } }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}
