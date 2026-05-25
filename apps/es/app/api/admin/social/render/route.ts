import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTemplate, validateFields } from "@/lib/social/templates";
import { dispatchSocialRender } from "@/lib/social/github-dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RenderRequest {
  templateId: string;
  fields: Record<string, unknown>;
  tenantId?: string | null; // null/undefined = render personal del operator
}

export async function POST(request: Request): Promise<Response> {
  const me = await getCurrentAdmin({ requirePermission: "social" });

  let body: RenderRequest;
  try {
    body = (await request.json()) as RenderRequest;
  } catch {
    return jsonError(400, "bad_request", "Body inválido");
  }

  if (!body.templateId || typeof body.templateId !== "string") {
    return jsonError(400, "missing_template", "templateId requerido");
  }

  const template = await getTemplate(body.templateId);
  if (!template) {
    return jsonError(404, "template_not_found", `Plantilla "${body.templateId}" no existe`);
  }

  const validation = validateFields(template, body.fields ?? {});
  if (!validation.ok) {
    return jsonError(400, "invalid_fields", validation.errors.join("; "));
  }

  // Scope: si es client (no operator), fuerza su tenant.
  let tenantId: string | null = null;
  if (me.isOperator) {
    tenantId = body.tenantId ?? null;
  } else {
    tenantId = me.tenant_id;
    if (!tenantId) {
      return jsonError(403, "no_tenant", "Tu usuario no está asignado a un tenant");
    }
  }

  const admin = createSupabaseAdminClient();
  const { data: job, error: insertErr } = await admin
    .from("social_render_jobs")
    .insert({
      tenant_id: tenantId,
      template_id: template.id,
      format: template.format,
      fields: validation.value,
      requested_by: me.email,
      status: "queued",
    })
    .select("id")
    .single();

  if (insertErr || !job) {
    return jsonError(500, "db_error", insertErr?.message ?? "No se pudo crear el job");
  }

  const dispatch = await dispatchSocialRender(job.id);
  if (!dispatch.ok) {
    await admin
      .from("social_render_jobs")
      .update({
        status: "failed",
        error_message: `Workflow dispatch falló: ${dispatch.error}`,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    return jsonError(502, "dispatch_failed", dispatch.error ?? "GitHub dispatch error");
  }

  await admin.from("social_audit_log").insert({
    tenant_id: tenantId,
    actor_email: me.email,
    action: "render.dispatched",
    details: { job_id: job.id, template_id: template.id },
  });

  return Response.json({ jobId: job.id, status: "queued" });
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
