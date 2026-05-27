import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTemplate, type TemplateField } from "@/lib/social/templates";
import { callGroqJson } from "@/lib/social/suggest-groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SuggestRequest {
  templateId: string;
  tenantId?: string | null;
  /** Tema/ángulo libre del usuario para guiar la sugerencia. Opcional. */
  topic?: string;
}

interface TenantContext {
  name: string;
  slug: string;
  systemPrompt: string | null;
  businessInfo: Record<string, unknown> | null;
  tone: string | null;
  language: string;
}

const DEFAULT_TONE = "cercano y directo, sin jerga corporativa";

export async function POST(request: Request): Promise<Response> {
  const me = await getCurrentAdmin({ requirePermission: "social" });

  let body: SuggestRequest;
  try {
    body = (await request.json()) as SuggestRequest;
  } catch {
    return jsonError(400, "bad_request", "Body inválido");
  }

  if (!body.templateId) {
    return jsonError(400, "missing_template", "templateId requerido");
  }

  const template = await getTemplate(body.templateId);
  if (!template) {
    return jsonError(404, "template_not_found", `Plantilla "${body.templateId}" no existe`);
  }

  // Scope tenant igual que el endpoint de render
  let tenantId: string | null = null;
  if (me.isOperator) tenantId = body.tenantId ?? null;
  else tenantId = me.tenant_id;

  const admin = createSupabaseAdminClient();
  const tenant = tenantId ? await loadTenantContext(admin, tenantId) : null;

  const systemPrompt = buildSystemPrompt(tenant);
  const userPrompt = buildUserPrompt(template, body.topic, tenant);

  let result: { json: unknown; model: string };
  try {
    result = await callGroqJson({
      systemPrompt,
      userPrompt,
      maxTokens: 1200,
      temperature: 0.9,
    });
  } catch (e) {
    return jsonError(502, "groq_error", e instanceof Error ? e.message : "Error desconocido de Groq");
  }

  // Normaliza y valida: respeta los IDs y maxLength del schema
  const normalized = normalizeAgainstSchema(template.fields, result.json);

  return Response.json({ fields: normalized, model: result.model });
}

async function loadTenantContext(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  tenantId: string
): Promise<TenantContext | null> {
  const { data: tenant } = await admin
    .from("tenants")
    .select("name, slug")
    .eq("id", tenantId)
    .maybeSingle();
  if (!tenant) return null;

  const { data: cfg } = await admin
    .from("chatbot_configs_cache")
    .select("system_prompt, business_info, tone, language")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  return {
    name: tenant.name as string,
    slug: tenant.slug as string,
    systemPrompt: cfg?.system_prompt ?? null,
    businessInfo: (cfg?.business_info as Record<string, unknown>) ?? null,
    tone: cfg?.tone ?? null,
    language: cfg?.language ?? "es",
  };
}

function buildSystemPrompt(tenant: TenantContext | null): string {
  const lines: string[] = [
    "Eres copywriter senior de redes sociales (Instagram, Facebook).",
    "Tu tarea es generar el copy de una plantilla concreta, respetando 100% el esquema de campos que se te indica.",
    "",
    "REGLAS NO NEGOCIABLES:",
    "- Devuelve SIEMPRE un objeto JSON con UNA clave por cada `id` de campo solicitado.",
    "- Respeta el `maxLength` de cada campo (cuenta caracteres, no palabras).",
    "- Para campos `list`, devuelve un array de strings respetando `minItems`, `maxItems` y `itemMaxLength`.",
    "- No incluyas hashtags, emojis ni signos decorativos salvo que el campo lo pida.",
    "- Si una palabra clave debe ir resaltada, envuélvela en asteriscos `*así*` solo si el `help` del campo lo indica.",
    "- Castellano natural, sin anglicismos innecesarios.",
    "- NO inventes datos concretos del negocio (precios, números, nombres) salvo que estén en el contexto.",
    "",
  ];

  if (tenant) {
    lines.push("CONTEXTO DEL CLIENTE PARA EL QUE ESCRIBES:");
    lines.push(`- Nombre: ${tenant.name} (slug: ${tenant.slug})`);
    if (tenant.tone) lines.push(`- Tono declarado: ${tenant.tone}`);
    if (tenant.systemPrompt) {
      lines.push(`- Persona / voz:`);
      lines.push(tenant.systemPrompt.slice(0, 2000));
    }
    if (tenant.businessInfo && Object.keys(tenant.businessInfo).length > 0) {
      lines.push(`- Datos del negocio: ${JSON.stringify(tenant.businessInfo).slice(0, 1500)}`);
    }
    lines.push(`- Idioma de salida: ${tenant.language}`);
  } else {
    lines.push(
      "CONTEXTO: no hay tenant seleccionado, escribes para ebecerra.es (desarrollador web freelance para autónomos/PYMEs en España, tono cercano y directo)."
    );
  }

  lines.push("", "Cuando hayas leído el contexto, ajusta vocabulario y referencias para que sean PROPIAS de este cliente — nada genérico que pueda ser de cualquier marca.");
  return lines.join("\n");
}

function buildUserPrompt(
  template: { name: string; description: string; fields: TemplateField[]; format: string },
  topic: string | undefined,
  tenant: TenantContext | null
): string {
  const lines: string[] = [];
  lines.push(`PLANTILLA: ${template.name}`);
  lines.push(`Descripción/uso: ${template.description}`);
  lines.push(`Formato: ${template.format}`);
  lines.push("");

  if (topic && topic.trim()) {
    lines.push("TEMA QUE PIDE EL USUARIO:");
    lines.push(topic.trim());
    lines.push("");
  } else {
    lines.push(
      tenant
        ? `TEMA: libre — elige un ángulo creativo que encaje con la voz de ${tenant.name} y aporte valor real a su público.`
        : "TEMA: libre — elige un ángulo creativo coherente con la marca."
    );
    lines.push("");
  }

  lines.push("CAMPOS A RELLENAR (devuelve JSON con estos IDs como claves):");
  lines.push("```json");
  lines.push(JSON.stringify(describeFields(template.fields), null, 2));
  lines.push("```");
  lines.push("");
  lines.push("Devuelve EXCLUSIVAMENTE el objeto JSON resultante, sin envolturas, sin comentarios, sin code-fence.");
  return lines.join("\n");
}

function describeFields(fields: TemplateField[]) {
  return fields.map((f) => {
    const desc: Record<string, unknown> = {
      id: f.id,
      type: f.type,
      label: f.label,
    };
    if (f.help) desc.guidance = f.help;
    if (f.required) desc.required = true;
    if (f.maxLength) desc.maxLength = f.maxLength;
    if (f.minItems) desc.minItems = f.minItems;
    if (f.maxItems) desc.maxItems = f.maxItems;
    if (f.itemMaxLength) desc.itemMaxLength = f.itemMaxLength;
    return desc;
  });
}

function normalizeAgainstSchema(
  fields: TemplateField[],
  raw: unknown
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!raw || typeof raw !== "object") return out;
  const obj = raw as Record<string, unknown>;

  for (const f of fields) {
    let v = obj[f.id];
    if (v === undefined || v === null) continue;

    if (f.type === "text" || f.type === "textarea") {
      if (typeof v !== "string") v = String(v);
      let s = (v as string).trim().replace(/^"|"$/g, "");
      if (f.maxLength && s.length > f.maxLength) s = s.slice(0, f.maxLength).trim();
      out[f.id] = s;
    } else if (f.type === "list") {
      if (!Array.isArray(v)) continue;
      let arr = v.map((x) => String(x).trim().replace(/^"|"$/g, ""));
      if (f.maxItems && arr.length > f.maxItems) arr = arr.slice(0, f.maxItems);
      if (f.itemMaxLength) {
        arr = arr.map((s) => (s.length > f.itemMaxLength! ? s.slice(0, f.itemMaxLength!).trim() : s));
      }
      out[f.id] = arr;
    } else {
      out[f.id] = v;
    }
  }
  return out;
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
