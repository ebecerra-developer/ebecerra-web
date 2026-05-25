import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AdminShell from "../../../AdminShell";
import JobStatusPoller from "./JobStatusPoller";

export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentAdmin({ requirePermission: "social" });
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  const { data: job } = await admin
    .from("social_render_jobs")
    .select(
      "id, tenant_id, template_id, format, status, storage_path, error_message, gh_run_url, created_at, completed_at, requested_by, width, height"
    )
    .eq("id", id)
    .maybeSingle();

  if (!job) notFound();
  if (!me.isOperator && job.tenant_id !== me.tenant_id) notFound();

  let signedUrl: string | null = null;
  if (job.status === "done" && job.storage_path) {
    const { data: signed } = await admin.storage
      .from("social-renders")
      .createSignedUrl(job.storage_path, 60 * 60);
    signedUrl = signed?.signedUrl ?? null;
  }

  return (
    <AdminShell
      activeSection="social"
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <div style={{ marginBottom: 24 }}>
        <a
          href="/admin/social"
          style={{ fontSize: 13, color: "#a8a29e", textDecoration: "none" }}
        >
          ← Volver
        </a>
      </div>
      <h2>Render — {job.template_id}</h2>
      <div style={{ display: "flex", gap: 24, marginBottom: 16, fontSize: 13, color: "#a8a29e" }}>
        <span>Creado: {new Date(job.created_at).toLocaleString("es-ES")}</span>
        <span>Por: {job.requested_by}</span>
        <span>
          Formato: {job.format} {job.width && job.height ? `(${job.width}×${job.height})` : ""}
        </span>
      </div>

      <JobStatusPoller
        jobId={job.id}
        initialStatus={job.status}
        initialSignedUrl={signedUrl}
        initialError={job.error_message}
        initialRunUrl={job.gh_run_url}
      />
    </AdminShell>
  );
}
