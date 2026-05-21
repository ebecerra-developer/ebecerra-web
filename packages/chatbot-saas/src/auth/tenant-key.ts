import { createHash, randomBytes } from "node:crypto";
import { findTenantByKeyHash } from "../db/tenants";
import { logAudit } from "../db/audit";
import type { Tenant } from "../types";

const KEY_PREFIX = "tk_live_";
const KEY_RAW_BYTES = 24; // 32 chars hex × 1.33 ≈ 32 base64 chars

/**
 * Genera una tenant key nueva. Devuelve raw (mostrar 1 vez), hash (guardar) y prefix (UI).
 */
export function generateTenantKey(): {
  raw: string;
  hash: string;
  prefix: string;
} {
  const random = randomBytes(KEY_RAW_BYTES).toString("base64url");
  const raw = `${KEY_PREFIX}${random}`;
  return {
    raw,
    hash: hashKey(raw),
    prefix: raw.slice(0, 15), // "tk_live_abcdefg"
  };
}

export function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export class InvalidTenantKeyError extends Error {
  constructor(public reason: "missing" | "malformed" | "not_found" | "inactive") {
    super(`Invalid tenant key: ${reason}`);
    this.name = "InvalidTenantKeyError";
  }
}

/**
 * Contexto opcional para audit log de intentos fallidos.
 * Si se pasa, los fallos de validateTenantKey escriben en chatbot_audit_log
 * con action='auth.failed' + detalles del request (IP, UA, endpoint).
 */
export type AuthAuditContext = {
  endpoint?: string;
  ip?: string | null;
  userAgent?: string | null;
  referer?: string | null;
};

/**
 * Valida tenant key del header X-Tenant-Key. Devuelve el tenant o lanza error tipado.
 *
 * Si se pasa context, los fallos se logean en chatbot_audit_log con
 * action='auth.failed'. El log es fire-and-forget — no bloquea la respuesta.
 */
export async function validateTenantKey(
  rawKey: string | null,
  context?: AuthAuditContext
): Promise<Tenant> {
  const keyPrefix = rawKey?.startsWith(KEY_PREFIX) ? rawKey.slice(0, 15) : null;

  try {
    if (!rawKey) throw new InvalidTenantKeyError("missing");
    if (!rawKey.startsWith(KEY_PREFIX)) throw new InvalidTenantKeyError("malformed");

    const hash = hashKey(rawKey);
    const tenant = await findTenantByKeyHash(hash);
    if (!tenant) throw new InvalidTenantKeyError("not_found");
    if (tenant.status !== "active") throw new InvalidTenantKeyError("inactive");

    return tenant;
  } catch (e) {
    if (e instanceof InvalidTenantKeyError && context) {
      void logAudit({
        tenant_id: null,
        action: "auth.failed",
        details: {
          reason: e.reason,
          endpoint: context.endpoint,
          key_prefix: keyPrefix,
          ip: context.ip ?? null,
          user_agent: context.userAgent ? context.userAgent.slice(0, 200) : null,
          referer: context.referer ?? null,
        },
      }).catch((err) =>
        console.error("[chatbot-saas] auth.failed audit log failed:", err)
      );
    }
    throw e;
  }
}

/**
 * Helper para extraer el contexto de auth desde un Request.
 * Saca IP (x-forwarded-for / x-real-ip), user agent y referer.
 */
export function authContextFromRequest(
  request: Request,
  endpoint: string
): AuthAuditContext {
  return {
    endpoint,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
  };
}
