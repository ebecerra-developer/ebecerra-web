import Link from "next/link";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AdminShell from "../../AdminShell";

export const dynamic = "force-dynamic";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function ChatbotSessionDrilldown({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const me = await getCurrentAdmin({ requirePermission: "chatbot" });

  const admin = createSupabaseAdminClient();
  const { data: messages, error } = await admin
    .from("chatbot_messages")
    .select("id, role, content, model, created_at, tenant_id")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const tenantId = messages?.[0]?.tenant_id ?? null;
  let tenantSlug: string | null = null;
  if (tenantId) {
    const { data: t } = await admin
      .from("tenants")
      .select("slug")
      .eq("id", tenantId)
      .maybeSingle();
    tenantSlug = (t?.slug as string | undefined) ?? null;
  }

  return (
    <AdminShell
      activeSection="chatbot"
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/admin/chatbot"
          style={{ color: "#a8a29e", textDecoration: "none", fontSize: 12 }}
        >
          ← Volver a conversaciones
        </Link>
      </div>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Conversación</h2>
        {tenantSlug && (
          <span className="admin-pill" data-app={tenantSlug}>
            {tenantSlug}
          </span>
        )}
        <code
          style={{
            fontSize: 11,
            color: "#78716c",
            background: "#141312",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {sessionId}
        </code>
      </div>

      {error && (
        <div className="admin-empty" style={{ borderColor: "#7f1d1d", color: "#fecaca" }}>
          Error al cargar: {error.message}
        </div>
      )}

      {!error && (!messages || messages.length === 0) && (
        <div className="admin-empty">No hay mensajes en esta sesión.</div>
      )}

      {messages && messages.length > 0 && (
        <div>
          {messages.map((m) => (
            <div key={m.id} className="admin-message" data-role={m.role}>
              <div className="admin-message-meta">
                <strong style={{ color: m.role === "user" ? "#38bdf8" : "#84cc16" }}>
                  {m.role}
                </strong>
                <span>{formatDateTime(m.created_at)}</span>
                {m.model && <span>modelo: {m.model}</span>}
              </div>
              <div className="admin-message-content">{m.content}</div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
