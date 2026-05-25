import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AdminShell from "../../../AdminShell";

export const dynamic = "force-dynamic";

type SessionRow = {
  session_id: string;
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

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const me = await getCurrentAdmin({ requirePermission: "chatbot" });

  const { tenantId } = await params;
  const admin = createSupabaseAdminClient();

  const [{ data: tenant }, { data: config }, { data: messages }] = await Promise.all([
    admin.from("tenants").select("*").eq("id", tenantId).maybeSingle(),
    admin.from("chatbot_configs_cache").select("*").eq("tenant_id", tenantId).maybeSingle(),
    admin
      .from("chatbot_messages")
      .select("session_id,role,content,created_at,model")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (!tenant) notFound();

  // Agrupar por session_id
  const sessions = new Map<string, SessionRow>();
  for (const m of (messages as Array<{ session_id: string; role: string; content: string; created_at: string }> | null) ?? []) {
    let entry = sessions.get(m.session_id);
    if (!entry) {
      entry = {
        session_id: m.session_id,
        message_count: 0,
        first_at: m.created_at,
        last_at: m.created_at,
        preview: "",
      };
      sessions.set(m.session_id, entry);
    }
    entry.message_count += 1;
    if (m.created_at > entry.last_at) entry.last_at = m.created_at;
    if (m.created_at < entry.first_at) entry.first_at = m.created_at;
    if (!entry.preview && m.role === "user") {
      entry.preview = m.content.slice(0, 140);
    }
  }
  const sessionRows = Array.from(sessions.values()).sort((a, b) =>
    b.last_at.localeCompare(a.last_at)
  );

  return (
    <AdminShell
      activeSection="chatbot"
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <nav style={{ marginBottom: 16, fontSize: 12 }}>
        <Link href="/admin/chatbot/tenants">← Todos los tenants</Link>
      </nav>

      <h2>{tenant.name}</h2>
      <p style={{ fontSize: 12, color: "#a8a29e", marginTop: -8 }}>
        slug: <code>{tenant.slug}</code> · status: <code>{tenant.status}</code> · key prefix:{" "}
        <code>{tenant.tenant_key_prefix}…</code>
      </p>

      <section style={{ marginTop: 24 }}>
        <h3>Sanity</h3>
        <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 16px", fontSize: 12 }}>
          <dt>Project</dt>
          <dd>{tenant.sanity_project_id ?? "—"}</dd>
          <dt>Dataset</dt>
          <dd>{tenant.sanity_dataset ?? "—"}</dd>
          <dt>Workspace</dt>
          <dd>{tenant.sanity_workspace ?? "—"}</dd>
          <dt>Document ID</dt>
          <dd>
            <code>{tenant.sanity_document_id ?? "—"}</code>
          </dd>
        </dl>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Config cacheado</h3>
        {!config ? (
          <p style={{ color: "#a8a29e", fontSize: 13 }}>
            Sin config sincronizado. Publica el documento Sanity con el webhook configurado para que se popule, o seed manual vía SQL.
          </p>
        ) : (
          <details>
            <summary style={{ cursor: "pointer", fontSize: 13 }}>
              Tono <code>{config.tone}</code> · idioma <code>{config.language}</code> · sync{" "}
              {formatDateTime(config.synced_at)} {config.source_revision ? `(rev ${config.source_revision.slice(0, 8)})` : ""}
            </summary>
            <pre style={{ fontSize: 11, padding: 12, background: "#1c1917", overflow: "auto", marginTop: 8 }}>
{config.system_prompt}
            </pre>
          </details>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Sesiones recientes ({sessionRows.length})</h3>
        {sessionRows.length === 0 ? (
          <div className="admin-empty">Aún no hay mensajes para este tenant.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Última</th>
                <th>Sesión</th>
                <th>Mensajes</th>
                <th>Primer mensaje del usuario</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessionRows.map((s) => (
                <tr key={s.session_id}>
                  <td>{formatDateTime(s.last_at)}</td>
                  <td>
                    <code style={{ fontSize: 11 }}>{s.session_id.slice(0, 12)}…</code>
                  </td>
                  <td>{s.message_count}</td>
                  <td>{s.preview || <em style={{ color: "#78716c" }}>—</em>}</td>
                  <td>
                    <Link href={`/admin/chatbot/${encodeURIComponent(s.session_id)}`}>Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </AdminShell>
  );
}
