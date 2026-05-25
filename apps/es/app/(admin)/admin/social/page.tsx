import Link from "next/link";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listTemplates } from "@/lib/social/templates";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function SocialIndexPage() {
  const me = await getCurrentAdmin({ requirePermission: "social" });
  const admin = createSupabaseAdminClient();
  const templates = await listTemplates();

  let jobsQuery = admin
    .from("social_render_jobs")
    .select("id, template_id, format, status, storage_path, requested_by, created_at, completed_at, error_message")
    .order("created_at", { ascending: false })
    .limit(20);
  if (!me.isOperator) jobsQuery = jobsQuery.eq("tenant_id", me.tenant_id);

  const { data: jobs } = await jobsQuery;

  return (
    <AdminShell
      activeSection="social"
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <h2>Generador de contenido social</h2>
      <p style={{ color: "#a8a29e", marginBottom: 32, fontSize: 14 }}>
        Elige una plantilla, rellena los campos y se renderiza automáticamente con los colores
        y el logo del tenant.
      </p>

      <h3 style={{ marginBottom: 16 }}>Plantillas</h3>
      {templates.length === 0 && (
        <div className="admin-empty">
          No hay plantillas registradas todavía. Añade carpetas en{" "}
          <code>social-templates/</code> con un <code>meta.json</code> y{" "}
          <code>template.html</code>.
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/admin/social/${t.id}`}
            style={{
              border: "1px solid #44403c",
              borderRadius: 6,
              padding: 16,
              textDecoration: "none",
              color: "inherit",
              display: "block",
              background: "#0c0a09",
            }}
          >
            <div style={{ fontSize: 12, color: "#a8a29e", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {t.format} · {t.width}×{t.height}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, margin: "6px 0 8px" }}>{t.name}</div>
            <div style={{ fontSize: 13, color: "#a8a29e", lineHeight: 1.5 }}>
              {t.description}
            </div>
          </Link>
        ))}
      </div>

      <h3 style={{ marginBottom: 16 }}>Últimos jobs</h3>
      {(!jobs || jobs.length === 0) && (
        <div className="admin-empty">Aún no has generado nada.</div>
      )}
      {jobs && jobs.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Plantilla</th>
              <th>Estado</th>
              <th>Por</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{new Date(j.created_at).toLocaleString("es-ES")}</td>
                <td>{j.template_id}</td>
                <td>
                  <span className="admin-pill" data-app={j.status}>
                    {j.status}
                  </span>
                </td>
                <td>{j.requested_by}</td>
                <td>
                  <Link href={`/admin/social/job/${j.id}`}>Ver →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  );
}
