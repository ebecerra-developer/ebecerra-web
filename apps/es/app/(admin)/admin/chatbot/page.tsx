import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

type SessionRow = {
  session_id: string;
  app: string;
  message_count: number;
  first_at: string;
  last_at: string;
  preview: string;
};

const APPS = ["es", "tech", "demos", "llaullau"] as const;
type App = (typeof APPS)[number];

function isApp(value: string): value is App {
  return (APPS as readonly string[]).includes(value);
}

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
  searchParams: Promise<{ app?: string; q?: string; days?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/admin/login");

  const params = await searchParams;
  const appFilter = params.app && isApp(params.app) ? params.app : null;
  const search = params.q?.trim() ?? "";
  const days = Number.parseInt(params.days ?? "30", 10) || 30;

  // Server Component dinámico (force-dynamic): se ejecuta una vez por request,
  // no es un componente reactivo. Date.now aquí es seguro.
  // eslint-disable-next-line react-hooks/purity
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Trae mensajes recientes y agrúpalos por session_id en memoria.
  // Para volumen actual (decenas-cientos/día) es suficiente; cuando crezca
  // se monta una vista materializada o una RPC con DISTINCT ON.
  let query = supabase
    .from("chatbot_messages")
    .select("session_id, app, role, content, created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (appFilter) query = query.eq("app", appFilter);
  if (search) query = query.ilike("content", `%${search}%`);

  const { data: rows, error } = await query;

  const sessions: Map<string, SessionRow> = new Map();
  if (rows) {
    // Recorrido en orden DESC: el primero que veamos de cada session_id es
    // el más reciente (last_at) y suele ser el assistant. Buscamos también
    // un user para preview.
    for (const row of rows) {
      let entry = sessions.get(row.session_id);
      if (!entry) {
        entry = {
          session_id: row.session_id,
          app: row.app,
          message_count: 0,
          first_at: row.created_at,
          last_at: row.created_at,
          preview: "",
        };
        sessions.set(row.session_id, entry);
      }
      entry.message_count += 1;
      // El primero que encontramos (DESC) es el más reciente.
      if (row.created_at > entry.last_at) entry.last_at = row.created_at;
      if (row.created_at < entry.first_at) entry.first_at = row.created_at;
      // Preview: el primer mensaje del usuario que veamos (más reciente).
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
          App
          <select name="app" defaultValue={appFilter ?? ""}>
            <option value="">Todas</option>
            {APPS.map((a) => (
              <option key={a} value={a}>
                {a}
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

      {!error && sortedSessions.length === 0 && (
        <div className="admin-empty">
          {search || appFilter
            ? "No hay conversaciones que coincidan con los filtros."
            : "No hay conversaciones aún. Cuando alguien use el chatbot, aparecerán aquí."}
        </div>
      )}

      {sortedSessions.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Última actividad</th>
              <th>App</th>
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
                  <span className="admin-pill" data-app={s.app}>
                    {s.app}
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
