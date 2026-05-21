/**
 * Lee env vars. SESSION_SECRET es siempre obligatorio (firma la cookie).
 * ADMIN_API_URL y CHATBOT_TENANT_KEY se pueden pasar explícitos a los builders
 * cuando hay multi-tenant en un solo deployment (ej. apps/demos).
 */

type ClientAdminEnv = {
  adminApiUrl: string | null;
  tenantKey: string | null;
  sessionSecret: string;
};

let cached: ClientAdminEnv | null = null;

export function getClientAdminEnv(): ClientAdminEnv {
  if (cached) return cached;
  const adminApiUrl = process.env.ADMIN_API_URL ?? null;
  const tenantKey = process.env.CHATBOT_TENANT_KEY ?? null;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error(
      "[client-admin-sdk] Missing SESSION_SECRET env var. Required for cookie signing."
    );
  }

  cached = {
    adminApiUrl: adminApiUrl ? adminApiUrl.replace(/\/$/, "") : null,
    tenantKey,
    sessionSecret,
  };
  return cached;
}

/**
 * Resuelve adminApiUrl + tenantKey con orden de prioridad: override explícito > env.
 * Lanza si no hay ninguno (un handler sin override en deployment sin env vars).
 */
export function resolveAdminConfig(overrides?: {
  adminApiUrl?: string;
  tenantKey?: string;
}): { adminApiUrl: string; tenantKey: string } {
  const env = getClientAdminEnv();
  const adminApiUrl = overrides?.adminApiUrl ?? env.adminApiUrl;
  const tenantKey = overrides?.tenantKey ?? env.tenantKey;

  if (!adminApiUrl) {
    throw new Error(
      "[client-admin-sdk] Missing adminApiUrl. Provide as override or set ADMIN_API_URL env var."
    );
  }
  if (!tenantKey) {
    throw new Error(
      "[client-admin-sdk] Missing tenantKey. Provide as override or set CHATBOT_TENANT_KEY env var."
    );
  }
  return {
    adminApiUrl: adminApiUrl.replace(/\/$/, ""),
    tenantKey,
  };
}
