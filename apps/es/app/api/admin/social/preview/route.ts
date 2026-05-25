import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTemplate, validateFields } from "@/lib/social/templates";
import { resolveBrand, renderTemplateHtml } from "@/lib/social/render-preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Devuelve el HTML renderizado de una plantilla con los fields actuales aplicados.
 * Usado por la UI del admin para mostrar preview en vivo dentro de un iframe.
 *
 * NO crea ningún job ni dispara render real — solo sustituye placeholders y
 * devuelve el HTML que el iframe puede mostrar directamente.
 */
export async function POST(request: Request): Promise<Response> {
  const me = await getCurrentAdmin({ requirePermission: "social" });

  let body: { templateId: string; fields: Record<string, unknown>; tenantId?: string | null };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const template = await getTemplate(body.templateId);
  if (!template) return new Response("Template not found", { status: 404 });

  const validation = validateFields(template, body.fields ?? {});
  // Para preview tolerante: si hay errores, igual renderiza con los defaults que
  // sí pasaron. El backend tira los strings vacíos como pide validateFields.
  const fields = validation.ok ? validation.value : applyDefaultsOnly(template, body.fields ?? {});

  // Scope tenant igual que el endpoint de render.
  let tenantId: string | null = null;
  if (me.isOperator) tenantId = body.tenantId ?? null;
  else tenantId = me.tenant_id;

  const admin = createSupabaseAdminClient();
  const brand = await resolveBrand(admin, tenantId);
  const html = await renderTemplateHtml(template.id, fields, brand);

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function applyDefaultsOnly(template: { fields: Array<{ id: string; default?: unknown }> }, raw: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of template.fields) {
    const v = raw[f.id];
    out[f.id] = v === undefined || v === null || v === "" ? f.default ?? "" : v;
  }
  return out;
}
