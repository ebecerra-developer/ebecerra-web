/**
 * Lee y valida las env vars requeridas por el SDK. Falla en build/runtime si faltan
 * críticas. Cache el resultado para no parsear en cada request.
 */

type ClientAdminEnv = {
  adminApiUrl: string;
  tenantKey: string;
  sessionSecret: string;
};

let cached: ClientAdminEnv | null = null;

export function getClientAdminEnv(): ClientAdminEnv {
  if (cached) return cached;
  const adminApiUrl = process.env.ADMIN_API_URL;
  const tenantKey = process.env.CHATBOT_TENANT_KEY;
  const sessionSecret = process.env.SESSION_SECRET;

  const missing: string[] = [];
  if (!adminApiUrl) missing.push("ADMIN_API_URL");
  if (!tenantKey) missing.push("CHATBOT_TENANT_KEY");
  if (!sessionSecret) missing.push("SESSION_SECRET");
  if (missing.length > 0) {
    throw new Error(
      `[client-admin-sdk] Missing env vars: ${missing.join(", ")}. ` +
        `Set them in .env.local (dev) and Vercel project settings (prod).`
    );
  }

  cached = {
    adminApiUrl: adminApiUrl!.replace(/\/$/, ""),
    tenantKey: tenantKey!,
    sessionSecret: sessionSecret!,
  };
  return cached;
}
