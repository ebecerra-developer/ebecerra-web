import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

type SessionRow = {
  session_id: string;
  tenant_id: string;
  tenant_slug: string;
  message_count: number;
  first_at: string;
  last_at: string;
  preview: string;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ChatbotSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string; q?: string; days?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/admin/login");

  const params = await searchParams;
  const tenantFilter = params.tenant?.trim() || null;
  const search = params.q?.trim() ?? "";
  const days = Number.parseInt(params.days ?? "30", 10) || 30;

  // Server Component dinámico (force-dynamic): se ejecuta una vez por request.
  // eslint-disable-next-line react-hooks/purity
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Admin client bypasea RLS — chatbot_messages es server-only.
  const admin = createSupabaseAdminClient();

  // 1. Tenants disponibles para filtrar + para mapear id→slug.
  const { data: tenantsRaw } = await admin
    .from("tenants")
    .select("id, slug, name")
    .neq("status", "archived")
    .order("slug", { ascending: true });
  const tenants = (tenantsRaw ?? []) as { id: string; slug: string; name: string }[];
  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  // 2. Mensajes recientes. Filtra por tenant_id si hay filtro.
  let query = admin
    .from("chatbot_messages")
    .select("session_id, tenant_id, role, content, created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (tenantFilter) {
    const t = tenants.find((x) => x.slug === tenantFilter);
    if (t) query = query.eq("tenant_id", t.id);
  }
  if (search) query = query.ilike("content", `%${search}%`);

  const { data: rows, error } = await query;

  const sessions = new Map<string, SessionRow>();
  if (rows) {
    for (const row of rows as {
      session_id: string;
      tenant_id: string;
      role: string;
      content: string;
      created_at: string;
    }[]) {
      let entry = sessions.get(row.session_id);
      if (!entry) {
        entry = {
          session_id: row.session_id,
          tenant_id: row.tenant_id,
          tenant_slug: tenantById.get(row.tenant_id)?.slug ?? "—",
          message_count: 0,
          first_at: row.created_at,
          last_at: row.created_at,
          preview: "",
        };
        sessions.set(row.session_id, entry);
      }
      entry.message_count += 1;
      if (row.created_at > entry.last_at) entry.last_at = row.created_at;
      if (row.created_at < entry.first_at) entry.first_at = row.created_at;
      if (!entry.preview && row.role === "user") {
        entry.preview = row.content.slice(0, 120);
      }
    }
  }

  const sortedSessions = Array.from(sessions.values()).sort((a, b) =>
    b.last_at.localeCompare(a.last_at)
  );

  return (
    <AdminShell activeSection="chatbot" userEmail={user.email}>
      <h2>Conversaciones del chatbot</h2>

      <form className="admin-filters" method="get">
        <label>
          Tenant
          <select name="tenant" defaultValue={tenantFilter ?? ""}>
            <option value="">Todos</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.slug}
              </option>
            ))}
          </select>
        </label>
        <label>
          Días
          <select name="days" defaultValue={String(days)}>
            <option value="1">1</option>
            <option value="7">7</option>
            <option value="30">30</option>
            <option value="90">90</option>
          </select>
        </label>
        <label>
          Buscar texto
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="palabra clave…"
          />
        </label>
        <button type="submit" className="admin-btn">
          Filtrar
        </button>
      </form>

      {error && (
        <div className="admin-empty" style={{ borderColor: "#7f1d1d", color: "#fecaca" }}>
          Error al cargar: {error.message}
        </div>
      )}

      {!error && sortedSessions.length === 0 && (
        <div className="admin-empty">
          {search || tenantFilter
            ? "No hay conversaciones que coincidan con los filtros."
            : "No hay conversaciones aún. Cuando alguien use el chatbot, aparecerán aquí."}
        </div>
      )}

      {sortedSessions.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Última actividad</th>
              <th>Tenant</th>
              <th>Mensajes</th>
              <th>Primer mensaje del usuario</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map((s) => (
              <tr key={s.session_id}>
                <td>{formatDateTime(s.last_at)}</td>
                <td>
                  <span className="admin-pill" data-app={s.tenant_slug}>
                    {s.tenant_slug}
                  </span>
                </td>
                <td>{s.message_count}</td>
                <td>{s.preview || <em style={{ color: "#78716c" }}>—</em>}</td>
                <td>
                  <Link href={`/admin/chatbot/${encodeURIComponent(s.session_id)}`}>
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  );
}
