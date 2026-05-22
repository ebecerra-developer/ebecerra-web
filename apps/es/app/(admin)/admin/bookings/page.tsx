import Link from "next/link";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

interface BookingRow {
  id: string;
  booking_tenant_id: string;
  slot_start_utc: string;
  slot_end_utc: string;
  status: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  locale: string;
  created_at: string;
  service_name: string | null;
  tenant_name: string | null;
  tenant_timezone: string | null;
}

const STATUSES = ["pending", "confirmed", "cancelled", "completed", "no_show"];

function formatDateTime(iso: string, timezone: string | null): string {
  return new Date(iso).toLocaleString("es-ES", {
    timeZone: timezone ?? "Europe/Madrid",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pickLocale(v: unknown, locale: string): string | null {
  if (!v || typeof v !== "object") return null;
  const obj = v as Record<string, unknown>;
  const val = obj[locale] ?? obj.es;
  return typeof val === "string" ? val : null;
}

export default async function BookingsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tenant?: string; from?: string; to?: string }>;
}) {
  const me = await getCurrentAdmin({ requirePermission: "bookings" });

  const params = await searchParams;
  const statusFilter = STATUSES.includes(params.status ?? "") ? params.status : null;
  const tenantFilter = params.tenant ?? null;
  const fromFilter = params.from ?? null;
  const toFilter = params.to ?? null;

  const admin = createSupabaseAdminClient();

  // Scope: si es client, restringe a su tenant_id.
  const { data: bookingTenants } = await admin
    .from("booking_tenants")
    .select("id, name, slug, timezone, tenant_id")
    .order("name");
  const visibleTenants = me.isOperator
    ? (bookingTenants ?? [])
    : (bookingTenants ?? []).filter((t) => t.tenant_id === me.tenant_id);
  const tenantById = new Map(visibleTenants.map((t) => [t.id, t]));
  const tenantIdsAllowed = visibleTenants.map((t) => t.id);

  let query = admin
    .from("bookings")
    .select(
      "id, booking_tenant_id, service_id, slot_start_utc, slot_end_utc, status, contact_name, contact_email, contact_phone, locale, created_at"
    )
    .order("slot_start_utc", { ascending: false })
    .limit(200);

  if (tenantIdsAllowed.length === 0) {
    // No tenants visible — no bookings.
    query = query.eq("booking_tenant_id", "00000000-0000-0000-0000-000000000000");
  } else {
    query = query.in("booking_tenant_id", tenantIdsAllowed);
  }
  if (statusFilter) query = query.eq("status", statusFilter);
  if (tenantFilter && tenantIdsAllowed.includes(tenantFilter)) {
    query = query.eq("booking_tenant_id", tenantFilter);
  }
  if (fromFilter) query = query.gte("slot_start_utc", `${fromFilter}T00:00:00Z`);
  if (toFilter) query = query.lte("slot_start_utc", `${toFilter}T23:59:59Z`);

  const { data: bookingsRaw, error } = await query;

  let rows: BookingRow[] = [];
  if (bookingsRaw && bookingsRaw.length > 0) {
    const serviceIds = Array.from(new Set(bookingsRaw.map((b) => b.service_id)));
    const { data: services } = await admin
      .from("booking_services")
      .select("id, name")
      .in("id", serviceIds);
    const serviceById = new Map(
      (services ?? []).map((s) => [s.id, s.name as unknown])
    );

    rows = bookingsRaw.map((b) => {
      const tenant = tenantById.get(b.booking_tenant_id);
      return {
        id: b.id,
        booking_tenant_id: b.booking_tenant_id,
        slot_start_utc: b.slot_start_utc,
        slot_end_utc: b.slot_end_utc,
        status: b.status,
        contact_name: b.contact_name,
        contact_email: b.contact_email,
        contact_phone: b.contact_phone,
        locale: b.locale,
        created_at: b.created_at,
        service_name: pickLocale(serviceById.get(b.service_id), b.locale),
        tenant_name: tenant?.name ?? null,
        tenant_timezone: tenant?.timezone ?? null,
      };
    });
  }

  return (
    <AdminShell
      activeSection="bookings"
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <h2>Reservas</h2>

      <form className="admin-filters" method="get">
        <label>
          Estado
          <select name="status" defaultValue={statusFilter ?? ""}>
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {me.isOperator && visibleTenants.length > 1 && (
          <label>
            Tenant
            <select name="tenant" defaultValue={tenantFilter ?? ""}>
              <option value="">Todos</option>
              {visibleTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Desde
          <input type="date" name="from" defaultValue={fromFilter ?? ""} />
        </label>
        <label>
          Hasta
          <input type="date" name="to" defaultValue={toFilter ?? ""} />
        </label>
        <button
          type="submit"
          style={{
            background: "transparent",
            border: "1px solid #44403c",
            color: "#d6d3d1",
            fontFamily: "inherit",
            fontSize: "12px",
            padding: "4px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Filtrar
        </button>
      </form>

      {error && (
        <div className="admin-empty" style={{ borderColor: "#7f1d1d", color: "#fecaca" }}>
          Error al cargar: {error.message}
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="admin-empty">
          {tenantIdsAllowed.length === 0
            ? "No hay tenants con reservas asignados a tu cuenta."
            : "No hay reservas que coincidan con los filtros."}
        </div>
      )}

      {rows.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              {me.isOperator && <th>Tenant</th>}
              <th>Servicio</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{formatDateTime(r.slot_start_utc, r.tenant_timezone)}</td>
                {me.isOperator && <td>{r.tenant_name ?? "?"}</td>}
                <td>{r.service_name ?? "?"}</td>
                <td>
                  <div>{r.contact_name}</div>
                  <div style={{ fontSize: "0.85em", color: "#888" }}>
                    {r.contact_email}
                  </div>
                </td>
                <td>
                  <span className="admin-pill" data-app={r.status}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/bookings/${r.id}`}>Ver →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  );
}
