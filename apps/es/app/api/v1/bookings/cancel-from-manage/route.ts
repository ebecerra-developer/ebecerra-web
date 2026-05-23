import {
  nativeProvider,
  isBookingError,
  isTokenError,
} from "@ebecerra/bookings/adapters/native";
import { sendCancelledEmail } from "@ebecerra/bookings/email";
import { corsPreflight } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req: Request): Promise<Response> {
  return corsPreflight(req);
}

/**
 * POST /api/v1/bookings/cancel-from-manage
 * Body: { token, booking_id, reason? }
 *
 * Cancela una reserva vía manage token (acepta también legacy 'cancel' scope).
 */
export async function POST(request: Request): Promise<Response> {
  let body: { token?: string; booking_id?: string; reason?: string } = {};
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }
  if (!body.token || !body.booking_id) {
    return jsonError(400, "missing_fields", "token, booking_id required");
  }

  try {
    const { booking } = await nativeProvider.cancelBooking({
      rawToken: body.token,
      bookingId: body.booking_id,
      by: "customer",
      reason: body.reason,
    });

    try {
      await sendCancelledEmail({
        bookingId: booking.id,
        reason: body.reason,
        rebookOrigin: process.env.BOOKINGS_PUBLIC_ORIGIN,
      });
    } catch (e) {
      console.error("[cancel-from-manage] sendCancelledEmail failed:", e);
    }

    return Response.json({ ok: true, status: "cancelled" });
  } catch (e) {
    if (isTokenError(e)) {
      return jsonError(400, e.reason, "Token inválido o ya usado");
    }
    if (isBookingError(e)) {
      return jsonError(400, e.code, e.message);
    }
    console.error("[cancel-from-manage]", e);
    return jsonError(500, "internal", "Error interno");
  }
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(
    JSON.stringify({ ok: false, error: { code, message } }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}
