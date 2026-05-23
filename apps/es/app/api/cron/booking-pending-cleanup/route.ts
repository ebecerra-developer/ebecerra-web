import { getSupabase, logAudit } from "@ebecerra/bookings/db";
import { sendPendingExpiredEmail } from "@ebecerra/bookings/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/booking-pending-cleanup
 *
 * Schedule: cada 15 minutos (vercel.json).
 *
 * Lógica: busca bookings con status='pending' y pending_expires_at < now.
 * Para cada uno: marca cancelled con cancelled_by='expired' + manda email
 * "Tu reserva pendiente caducó".
 */
export async function GET(request: Request): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const supabase = getSupabase();
  const nowIso = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from("bookings")
    .select("id, booking_tenant_id, contact_email")
    .eq("status", "pending")
    .lt("pending_expires_at", nowIso)
    .limit(200);
  if (error) throw error;

  if (!expired || expired.length === 0) {
    return Response.json({ ok: true, cancelled: 0 });
  }

  let cancelled = 0;
  const errors: Array<{ bookingId: string; error: string }> = [];
  const rebookOrigin = process.env.BOOKINGS_PUBLIC_ORIGIN;

  for (const b of expired) {
    try {
      const { error: upErr } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancelled_by: "expired",
        })
        .eq("id", b.id)
        .eq("status", "pending"); // race-safe: si ya está confirmed o cancelled, no toca.
      if (upErr) throw upErr;

      await logAudit({
        booking_tenant_id: b.booking_tenant_id,
        booking_id: b.id,
        action: "booking.pending_expired",
      });

      try {
        await sendPendingExpiredEmail({ bookingId: b.id, rebookOrigin });
      } catch (mailErr) {
        console.error(
          `[pending-cleanup] email failed for ${b.id}:`,
          mailErr
        );
      }
      cancelled++;
    } catch (e) {
      errors.push({
        bookingId: b.id,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return Response.json({
    ok: true,
    considered: expired.length,
    cancelled,
    errors,
  });
}
