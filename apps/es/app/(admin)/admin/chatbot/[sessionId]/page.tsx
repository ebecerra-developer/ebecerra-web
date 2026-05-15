import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/admin/login");

  // Admin client (secret key) bypasea RLS — chatbot_messages es server-only.
  const admin = createSupabaseAdminClient();
  const { data: messages, error } = await admin
    .from("chatbot_messages")
    .select("id, role, content, model, created_at, app")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const app = messages?.[0]?.app;

  return (
    <AdminShell activeSection="chatbot" userEmail={user.email}>
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
        {app && (
          <span className="admin-pill" data-app={app}>
            {app}
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
