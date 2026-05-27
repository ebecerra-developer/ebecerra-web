import Link from "next/link";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listTemplates, type TemplateMeta } from "@/lib/social/templates";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

interface CategoryDef {
  key: string;
  label: string;
  description: string;
  formats: TemplateMeta["format"][];
  badgeColor: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "feed-posts",
    label: "Posts para feed",
    description: "Imagen estática 1080×1350 (4:5). El feed clásico de Instagram y Facebook.",
    formats: ["post-4x5", "square-1x1"],
    badgeColor: "#047857",
  },
  {
    key: "stories",
    label: "Stories e historias",
    description: "Imagen estática 1080×1920 (9:16) para historias y destacadas. Sin animación.",
    formats: ["story-9x16"],
    badgeColor: "#7c3aed",
  },
  {
    key: "reels",
    label: "Reels animados",
    description: "Vídeo MP4 con GSAP. Tardan ~3 min en generarse, pero el resultado es muy llamativo.",
    formats: ["reel-9x16"],
    badgeColor: "#dc2626",
  },
  {
    key: "covers",
    label: "Portadas y banners",
    description: "Covers de Facebook, Google Business Profile, destacadas de IG. Tamaños grandes.",
    formats: ["fb-cover", "gbp-cover"],
    badgeColor: "#0891b2",
  },
];

function categorizeTemplates(all: TemplateMeta[]) {
  return CATEGORIES.map((cat) => ({
    ...cat,
    templates: all.filter((t) => cat.formats.includes(t.format)),
  })).filter((c) => c.templates.length > 0);
}

export default async function SocialIndexPage() {
  const me = await getCurrentAdmin({ requirePermission: "social" });
  const admin = createSupabaseAdminClient();
  const templates = await listTemplates();
  const grouped = categorizeTemplates(templates);

  let jobsQuery = admin
    .from("social_render_jobs")
    .select(
      "id, template_id, format, status, storage_path, requested_by, created_at, completed_at, error_message"
    )
    .order("created_at", { ascending: false })
    .limit(10);
  if (!me.isOperator) jobsQuery = jobsQuery.eq("tenant_id", me.tenant_id);

  const { data: jobs } = await jobsQuery;

  return (
    <AdminShell
      activeSection="social"
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <h2 style={{ marginBottom: 4 }}>Generador de contenido social</h2>
      <p style={{ color: "#a8a29e", marginBottom: 40, fontSize: 14, maxWidth: 720 }}>
        Elige una plantilla, rellena los campos (o pídele a la IA que lo haga por ti) y se
        renderiza automáticamente con la paleta y tipografía del tenant.
      </p>

      {templates.length === 0 && (
        <div className="admin-empty">
          No hay plantillas registradas. Añade carpetas en <code>social-templates/</code>.
        </div>
      )}

      {grouped.map((cat) => (
        <section key={cat.key} style={{ marginBottom: 48 }}>
          <header
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 6,
              borderBottom: "1px solid #292524",
              paddingBottom: 12,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: cat.badgeColor,
                display: "inline-block",
              }}
              aria-hidden
            />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{cat.label}</h3>
            <span style={{ fontSize: 12, color: "#78716c" }}>
              {cat.templates.length} plantilla{cat.templates.length === 1 ? "" : "s"}
            </span>
          </header>
          <p style={{ color: "#a8a29e", fontSize: 13, marginBottom: 16, marginTop: 8 }}>
            {cat.description}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {cat.templates.map((t) => (
              <TemplateCard key={t.id} template={t} badgeColor={cat.badgeColor} />
            ))}
          </div>
        </section>
      ))}

      <section>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Últimos jobs
        </h3>
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
      </section>
    </AdminShell>
  );
}

function TemplateCard({ template, badgeColor }: { template: TemplateMeta; badgeColor: string }) {
  const isReel = template.format === "reel-9x16";
  return (
    <Link
      href={`/admin/social/${template.id}`}
      style={{
        position: "relative",
        border: "1px solid #44403c",
        borderRadius: 8,
        padding: 18,
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "#0c0a09",
        transition: "border-color 120ms ease, transform 120ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
        <span
          style={{
            background: badgeColor,
            color: "#fafaf9",
            padding: "3px 8px",
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            fontSize: 10,
          }}
        >
          {template.format}
        </span>
        <span style={{ color: "#78716c", fontFamily: "monospace" }}>
          {template.width}×{template.height}
        </span>
        {isReel && template.durationSeconds && (
          <span
            style={{
              color: "#dc2626",
              fontWeight: 600,
              fontSize: 11,
              marginLeft: "auto",
            }}
          >
            {template.durationSeconds}s
          </span>
        )}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{template.name}</div>
      <div style={{ fontSize: 13, color: "#a8a29e", lineHeight: 1.5, flex: 1 }}>
        {template.description}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#57534e",
          fontFamily: "monospace",
          paddingTop: 6,
          borderTop: "1px dashed #292524",
        }}
      >
        {template.id}
      </div>
    </Link>
  );
}
