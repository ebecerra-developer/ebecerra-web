import { getSupabase, logAudit } from "@ebecerra/bookings/db";
import { issueToken } from "@ebecerra/bookings/tokens";
import { sendReminderEmail } from "@ebecerra/bookings/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/booking-reminders
 *
 * Schedule: cada hora (configurado en apps/es/vercel.json).
 * Auth: Vercel cron añade `Authorization: Bearer <CRON_SECRET>` automáticamente
 *       cuando hay env CRON_SECRET. Si no está configurada, cualquiera podría
 *       llamarlo (usar solo en prod con CRON_SECRET seteada).
 *
 * Lógica:
 *  - Busca bookings confirmed con reminder_sent_at IS NULL y slot entre
 *    booking_tenants.reminder_hours_before ± 1h respecto a now.
 *  - Por cada uno: emite cancel token fresco + envía email + marca reminder_sent_at.
 *  - Idempotente por reminder_sent_at + idempotencyKey de Resend.
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
  const now = Date.now();

  // Búsqueda amplia: bookings confirmed con slot en las próximas 30h
  // (cubre cualquier reminder_hours_before entre 0 y 30). El filtro fino
  // se hace por tenant abajo. El índice parcial bookings_reminder_pending_idx
  // hace esto barato.
  const lookaheadMs = 30 * 60 * 60 * 1000;
  const lookbackMs = 1 * 60 * 60 * 1000; // por si se nos pasó alguno
  const fromIso = new Date(now - lookbackMs).toISOString();
  const toIso = new Date(now + lookaheadMs).toISOString();

  const { data: pending, error: pendingErr } = await supabase
    .from("bookings")
    .select(
      "id, booking_tenant_id, slot_start_utc, contact_email, locale"
    )
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("slot_start_utc", fromIso)
    .lte("slot_start_utc", toIso);
  if (pendingErr) throw pendingErr;

  if (!pending || pending.length === 0) {
    return Response.json({ ok: true, sent: 0, considered: 0 });
  }

  // Cargar tenant.reminder_hours_before para cada tenant único.
  const tenantIds = Array.from(new Set(pending.map((b) => b.booking_tenant_id)));
  const { data: tenants, error: tErr } = await supabase
    .from("booking_tenants")
    .select("id, reminder_hours_before")
    .in("id", tenantIds);
  if (tErr) throw tErr;
  const reminderHoursByTenant = new Map<string, number>(
    (tenants ?? []).map((t) => [t.id, t.reminder_hours_before])
  );

  // Filtrar los que entran dentro de [reminderHours - 1h, reminderHours + 1h].
  const due = pending.filter((b) => {
    const hoursBefore = reminderHoursByTenant.get(b.booking_tenant_id) ?? 24;
    const targetMs = new Date(b.slot_start_utc).getTime() - hoursBefore * 60 * 60 * 1000;
    return Math.abs(now - targetMs) <= 60 * 60 * 1000;
  });

  let sent = 0;
  const errors: Array<{ bookingId: string; error: string }> = [];

  for (const booking of due) {
    try {
      const manageToken = await issueToken({
        bookingId: booking.id,
        scope: "manage",
        expiresAt: new Date(booking.slot_start_utc),
      });
      await sendReminderEmail({
        bookingId: booking.id,
        manageSignedToken: manageToken.signed,
      });
      const { error: updErr } = await supabase
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", booking.id);
      if (updErr) throw updErr;
      await logAudit({
        booking_tenant_id: booking.booking_tenant_id,
        booking_id: booking.id,
        action: "booking.reminder_sent",
      });
      sent++;
    } catch (e) {
      errors.push({
        bookingId: booking.id,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return Response.json({
    ok: true,
    considered: pending.length,
    due: due.length,
    sent,
    errors,
  });
}
