import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AdminShell from "../../AdminShell";

export const dynamic = "force-dynamic";

type TenantRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  config_source: string;
  sanity_project_id: string | null;
  sanity_document_id: string | null;
  monthly_message_limit: number;
  created_at: string;
};

type UsageRow = {
  tenant_id: string;
  messages_count: number;
  conversations_count: number;
  tokens_total: number;
};

function firstOfMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export default async function TenantsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/admin/login");

  const admin = createSupabaseAdminClient();

  const [{ data: tenants }, { data: usage }] = await Promise.all([
    admin
      .from("tenants")
      .select(
        "id,slug,name,status,config_source,sanity_project_id,sanity_document_id,monthly_message_limit,created_at"
      )
      .neq("status", "archived")
      .order("created_at", { ascending: true }),
    admin
      .from("chatbot_usage")
      .select("tenant_id,messages_count,conversations_count,tokens_total")
      .eq("period_start", firstOfMonth()),
  ]);

  const usageByTenant = new Map<string, UsageRow>();
  for (const u of (usage as UsageRow[] | null) ?? []) {
    usageByTenant.set(u.tenant_id, u);
  }

  const rows = ((tenants as TenantRow[] | null) ?? []).map((t) => ({
    ...t,
    usage: usageByTenant.get(t.id) ?? {
      tenant_id: t.id,
      messages_count: 0,
      conversations_count: 0,
      tokens_total: 0,
    },
  }));

  return (
    <AdminShell activeSection="chatbot" userEmail={user.email}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Tenants del chatbot</h2>
        <nav style={{ display: "flex", gap: 12, fontSize: 12 }}>
          <Link href="/admin/chatbot">Conversaciones (legacy)</Link>
          <Link href="/admin/chatbot/tenants">Tenants (V1)</Link>
        </nav>
      </header>

      {rows.length === 0 ? (
        <div className="admin-empty">No hay tenants provisionados.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Status</th>
              <th>Fuente config</th>
              <th>Sanity doc</th>
              <th>Mensajes / mes</th>
              <th>Conversaciones</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong>{t.name}</strong>
                  <div style={{ fontSize: 11, color: "#78716c" }}>{t.slug}</div>
                </td>
                <td>
                  <span className="admin-pill" data-status={t.status}>
                    {t.status}
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>{t.config_source}</td>
                <td style={{ fontSize: 12, fontFamily: "monospace" }}>
                  {t.sanity_document_id ?? "—"}
                </td>
                <td>
                  {t.usage.messages_count} / {t.monthly_message_limit}
                </td>
                <td>{t.usage.conversations_count}</td>
                <td>
                  <Link href={`/admin/chatbot/tenants/${t.id}`}>Ver →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <details style={{ marginTop: 32, fontSize: 12, color: "#a8a29e" }}>
        <summary style={{ cursor: "pointer" }}>Cómo provisionar un tenant nuevo</summary>
        <div style={{ paddingTop: 12 }}>
          <p>
            En V1 los tenants se provisionan manualmente vía SQL. Ver{" "}
            <code>docs/chatbot-onboard-new-tenant.md</code> para la receta paso a paso.
          </p>
          <p>
            Pasos rápidos:
          </p>
          <ol>
            <li>Generar tenant key con el script de provisioning.</li>
            <li>Insertar fila en <code>tenants</code> con sanity_project_id + sanity_document_id.</li>
            <li>Sembrar <code>chatbot_configs_cache</code> con system_prompt inicial (o esperar webhook).</li>
            <li>Configurar webhook Sanity → <code>https://chats.ebecerra.es/api/saas/sync-config?project=...</code></li>
            <li>Añadir <code>CHATBOT_TENANT_KEY</code> + <code>CHATBOT_API_URL</code> a env vars del cliente.</li>
          </ol>
        </div>
      </details>
    </AdminShell>
  );
}
