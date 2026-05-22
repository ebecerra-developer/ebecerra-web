"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendCancelledEmail } from "@ebecerra/bookings/email";

/**
 * Verifica que el admin actual puede operar sobre el booking dado.
 * Operator: siempre. Client: solo si pertenece a su tenant_id.
 */
async function authorizeBooking(bookingId: string) {
  const me = await getCurrentAdmin({ requirePermission: "bookings" });
  const admin = createSupabaseAdminClient();
  const { data: booking, error } = await admin
    .from("bookings")
    .select("id, booking_tenant_id, status")
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw error;
  if (!booking) throw new Error("Booking not found");
  if (!me.isOperator) {
    const { data: tenant } = await admin
      .from("booking_tenants")
      .select("tenant_id")
      .eq("id", booking.booking_tenant_id)
      .maybeSingle();
    if (!tenant || tenant.tenant_id !== me.tenant_id) {
      throw new Error("Forbidden");
    }
  }
  return { me, booking, admin };
}

export async function cancelBookingAction(formData: FormData) {
  const bookingId = formData.get("booking_id");
  const reason = formData.get("reason");
  if (typeof bookingId !== "string") throw new Error("Invalid booking_id");
  const { me, booking, admin } = await authorizeBooking(bookingId);
  if (!["pending", "confirmed"].includes(booking.status)) {
    throw new Error("Booking not active");
  }
  const { error } = await admin
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: "business",
      cancellation_reason: typeof reason === "string" ? reason : null,
    })
    .eq("id", bookingId);
  if (error) throw error;
  await admin.from("booking_audit_log").insert({
    booking_tenant_id: booking.booking_tenant_id,
    booking_id: bookingId,
    actor_email: me.email,
    action: "booking.cancelled",
    details: { by: "business", reason },
  });
  try {
    await sendCancelledEmail({
      bookingId,
      reason: typeof reason === "string" ? reason : undefined,
    });
  } catch (e) {
    console.error("[admin/bookings/cancel] sendCancelledEmail failed:", e);
  }
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}

export async function markCompletedAction(formData: FormData) {
  const bookingId = formData.get("booking_id");
  if (typeof bookingId !== "string") throw new Error("Invalid booking_id");
  const { me, booking, admin } = await authorizeBooking(bookingId);
  if (booking.status !== "confirmed") throw new Error("Booking not confirmed");
  const { error } = await admin
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId);
  if (error) throw error;
  await admin.from("booking_audit_log").insert({
    booking_tenant_id: booking.booking_tenant_id,
    booking_id: bookingId,
    actor_email: me.email,
    action: "booking.completed",
  });
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}

export async function markNoShowAction(formData: FormData) {
  const bookingId = formData.get("booking_id");
  if (typeof bookingId !== "string") throw new Error("Invalid booking_id");
  const { me, booking, admin } = await authorizeBooking(bookingId);
  if (booking.status !== "confirmed") throw new Error("Booking not confirmed");
  const { error } = await admin
    .from("bookings")
    .update({ status: "no_show" })
    .eq("id", bookingId);
  if (error) throw error;
  await admin.from("booking_audit_log").insert({
    booking_tenant_id: booking.booking_tenant_id,
    booking_id: bookingId,
    actor_email: me.email,
    action: "booking.no_show",
  });
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}
