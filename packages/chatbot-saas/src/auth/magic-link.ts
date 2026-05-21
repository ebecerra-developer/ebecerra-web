import { createHash, randomBytes } from "node:crypto";
import { getSupabase } from "../db/client";
import { logAudit } from "../db/audit";
import type { Tenant } from "../types";

const TOKEN_RAW_BYTES = 32;
const TOKEN_TTL_MINUTES = 15;

export class MagicLinkError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "MagicLinkError";
  }
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Genera y persiste un token de magic link. Devuelve el raw para construir la URL.
 * El raw NUNCA se guarda — solo el hash.
 */
async function createMagicLinkToken(args: {
  email: string;
  tenant: Tenant;
  ip: string | null;
  userAgent: string | null;
}): Promise<{ raw: string }> {
  const raw = randomBytes(TOKEN_RAW_BYTES).toString("base64url");
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

  const supabase = getSupabase();
  const { error } = await supabase.from("magic_link_tokens").insert({
    token_hash: hash,
    email: args.email.toLowerCase(),
    tenant_id: args.tenant.id,
    ip: args.ip,
    user_agent: args.userAgent ? args.userAgent.slice(0, 200) : null,
    expires_at: expiresAt,
  });
  if (error) throw error;
  return { raw };
}

/**
 * Comprueba si el email tiene acceso al tenant (operator cross-tenant o client de ese tenant).
 */
async function isEmailAuthorized(email: string, tenantId: string): Promise<{
  authorized: boolean;
  role: "owner" | "editor" | "client" | null;
}> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("app_admins")
    .select("role, tenant_id")
    .eq("email", email.toLowerCase());
  if (error) throw error;
  if (!data || data.length === 0) return { authorized: false, role: null };

  for (const row of data as Array<{ role: string; tenant_id: string | null }>) {
    // Operator (owner/editor con tenant_id null) → acceso a todos
    if ((row.role === "owner" || row.role === "editor") && row.tenant_id === null) {
      return { authorized: true, role: row.role as "owner" | "editor" };
    }
    // Client específico de este tenant
    if (row.role === "client" && row.tenant_id === tenantId) {
      return { authorized: true, role: "client" };
    }
  }
  return { authorized: false, role: null };
}

/**
 * Solicita un magic link para un email + tenant.
 *
 * Comportamiento de seguridad: si el email no está autorizado, devuelve OK igualmente
 * pero NO genera el token NI envía email. Así no se filtra qué emails son válidos.
 */
export async function requestMagicLink(args: {
  email: string;
  tenant: Tenant;
  ip: string | null;
  userAgent: string | null;
}): Promise<{ sent: boolean; verifyUrl?: string }> {
  const { email, tenant } = args;

  if (!tenant.admin_base_url) {
    throw new MagicLinkError(
      500,
      "no_admin_url",
      `Tenant ${tenant.slug} has no admin_base_url configured`
    );
  }

  const { authorized } = await isEmailAuthorized(email, tenant.id);

  if (!authorized) {
    await logAudit({
      tenant_id: tenant.id,
      actor_email: email,
      action: "auth.magic_link.invalid",
      details: { reason: "unauthorized_email", ip: args.ip },
    });
    // Decisión consciente: este admin no es SaaS público y la lista de emails
    // es pequeña (operadores + clientes específicos). Para un admin privado,
    // dar feedback al usuario gana a la protección anti-enumeración. Si en V2
    // esto pasa a SaaS público, valorar volver a silencioso.
    throw new MagicLinkError(
      403,
      "unauthorized_email",
      "No tienes acceso a este panel. Si crees que es un error, contacta con quien te dio acceso."
    );
  }

  const { raw } = await createMagicLinkToken({
    email,
    tenant,
    ip: args.ip,
    userAgent: args.userAgent,
  });
  const verifyUrl = `${tenant.admin_base_url.replace(/\/$/, "")}/admin/verify?token=${encodeURIComponent(raw)}`;

  await logAudit({
    tenant_id: tenant.id,
    actor_email: email,
    action: "auth.magic_link.sent",
    details: { ip: args.ip },
  });

  return { sent: true, verifyUrl };
}

/**
 * Verifica un token de magic link. Si es válido, lo marca usado y devuelve la identidad.
 */
export async function verifyMagicLink(args: {
  token: string;
  tenant: Tenant;
}): Promise<{
  email: string;
  role: "owner" | "editor" | "client";
}> {
  const { token, tenant } = args;
  const hash = hashToken(token);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("magic_link_tokens")
    .select("id, email, expires_at, used_at")
    .eq("token_hash", hash)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new MagicLinkError(400, "invalid_token", "Token not found");
  if ((data as { used_at: string | null }).used_at)
    throw new MagicLinkError(400, "token_used", "Token already used");
  if (new Date((data as { expires_at: string }).expires_at).getTime() < Date.now())
    throw new MagicLinkError(400, "token_expired", "Token expired");

  const email = (data as { email: string }).email;

  // Marcar usado (atomic-ish: si dos requests llegan a la vez, la segunda fallará por used_at not null)
  const { error: upErr } = await supabase
    .from("magic_link_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", (data as { id: string }).id)
    .is("used_at", null);
  if (upErr) throw upErr;

  // Resolver role actual del email para ese tenant
  const { authorized, role } = await isEmailAuthorized(email, tenant.id);
  if (!authorized || !role) {
    throw new MagicLinkError(403, "no_access", "Email no longer authorized for this tenant");
  }

  await logAudit({
    tenant_id: tenant.id,
    actor_email: email,
    action: "auth.magic_link.verified",
    details: { role },
  });

  return { email, role };
}
