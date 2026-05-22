import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AdminShell from "../../AdminShell";
import {
  cancelBookingAction,
  markCompletedAction,
  markNoShowAction,
} from "../actions";

export const dynamic = "force-dynamic";

function pickLocale(v: unknown, locale: string): string | null {
  if (!v || typeof v !== "object") return null;
  const obj = v as Record<string, unknown>;
  const val = obj[locale] ?? obj.es;
  return typeof val === "string" ? val : null;
}

function formatInTz(iso: string, tz: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    timeZone: tz,
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentAdmin({ requirePermission: "bookings" });
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  const { data: booking, error } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!booking) notFound();

  // Scope check
  const { data: tenant } = await admin
    .from("booking_tenants")
    .select("*")
    .eq("id", booking.booking_tenant_id)
    .maybeSingle();
  if (!tenant) notFound();
  if (!me.isOperator && tenant.tenant_id !== me.tenant_id) {
    notFound();
  }

  const { data: service } = await admin
    .from("booking_services")
    .select("name, duration_min, price_cents, currency")
    .eq("id", booking.service_id)
    .maybeSingle();

  const { data: audit } = await admin
    .from("booking_audit_log")
    .select("action, actor_email, details, created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const tz = tenant.timezone as string;
  const serviceName = pickLocale(service?.name, booking.locale) ?? "?";
  const isActive = ["pending", "confirmed"].includes(booking.status);
  const isConfirmed = booking.status === "confirmed";

  return (
    <AdminShell
      activeSection="bookings"
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <p style={{ margin: "0 0 1rem" }}>
        <Link href="/admin/bookings">← Reservas</Link>
      </p>

      <h2>
        Reserva · <span style={{ color: "#a8a29e" }}>{booking.id.slice(0, 8)}</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1.5rem 0" }}>
        <div>
          <h3 style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 0.3rem" }}>Tenant</h3>
          <p style={{ margin: 0 }}>{tenant.name}</p>
        </div>
        <div>
          <h3 style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 0.3rem" }}>Servicio</h3>
          <p style={{ margin: 0 }}>{serviceName} ({service?.duration_min ?? "?"} min)</p>
        </div>
        <div>
          <h3 style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 0.3rem" }}>Fecha y hora</h3>
          <p style={{ margin: 0 }}>{formatInTz(booking.slot_start_utc, tz)}</p>
        </div>
        <div>
          <h3 style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 0.3rem" }}>Estado</h3>
          <p style={{ margin: 0 }}>
            <span className="admin-pill" data-app={booking.status}>{booking.status}</span>
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 0.3rem" }}>Cliente</h3>
          <p style={{ margin: 0 }}>{booking.contact_name}</p>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.9em", color: "#888" }}>
            {booking.contact_email}
            {booking.contact_phone && ` · ${booking.contact_phone}`}
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 0.3rem" }}>Creada</h3>
          <p style={{ margin: 0 }}>{formatInTz(booking.created_at, tz)}</p>
        </div>
      </div>

      {booking.notes && (
        <div style={{ margin: "1rem 0" }}>
          <h3 style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 0.3rem" }}>Notas</h3>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{booking.notes}</p>
        </div>
      )}

      {booking.cancellation_reason && (
        <div style={{ margin: "1rem 0" }}>
          <h3 style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 0.3rem" }}>Motivo cancelación</h3>
          <p style={{ margin: 0 }}>{booking.cancellation_reason}</p>
        </div>
      )}

      {isActive && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "2rem 0" }}>
          {isConfirmed && (
            <>
              <form action={markCompletedAction}>
                <input type="hidden" name="booking_id" value={booking.id} />
                <button type="submit" className="admin-btn">Marcar completada</button>
              </form>
              <form action={markNoShowAction}>
                <input type="hidden" name="booking_id" value={booking.id} />
                <button type="submit" className="admin-btn">Marcar no-show</button>
              </form>
            </>
          )}
          <form action={cancelBookingAction} style={{ display: "flex", gap: "0.5rem" }}>
            <input type="hidden" name="booking_id" value={booking.id} />
            <input
              type="text"
              name="reason"
              placeholder="Motivo (opcional)"
              style={{
                background: "transparent",
                border: "1px solid #44403c",
                color: "#d6d3d1",
                padding: "4px 10px",
                fontFamily: "inherit",
                fontSize: "12px",
                borderRadius: "4px",
              }}
            />
            <button type="submit" className="admin-btn admin-btn-danger">Cancelar reserva</button>
          </form>
        </div>
      )}

      <h3 style={{ margin: "2rem 0 0.5rem" }}>Historial</h3>
      {audit && audit.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cuándo</th>
              <th>Acción</th>
              <th>Actor</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((a, i) => (
              <tr key={i}>
                <td>{formatInTz(a.created_at, tz)}</td>
                <td>{a.action}</td>
                <td>{a.actor_email ?? "(sistema)"}</td>
                <td style={{ fontSize: "0.85em", color: "#888" }}>
                  {a.details ? JSON.stringify(a.details) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#888" }}>Sin eventos.</p>
      )}
    </AdminShell>
  );
}
