import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const me = await getCurrentAdmin({ requirePermission: "social" });
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  const { data: job, error } = await admin
    .from("social_render_jobs")
    .select(
      "id, tenant_id, template_id, format, status, storage_path, width, height, error_message, gh_run_url, created_at, completed_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return jsonError(500, "db_error", error.message);
  if (!job) return jsonError(404, "not_found", "Job no encontrado");

  // Scope tenant si el admin es client.
  if (!me.isOperator && job.tenant_id !== me.tenant_id) {
    return jsonError(404, "not_found", "Job no encontrado");
  }

  let signedUrl: string | null = null;
  if (job.status === "done" && job.storage_path) {
    const { data: signed } = await admin.storage
      .from("social-renders")
      .createSignedUrl(job.storage_path, 60 * 60); // 1h
    signedUrl = signed?.signedUrl ?? null;
  }

  return Response.json({ job, signedUrl });
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
