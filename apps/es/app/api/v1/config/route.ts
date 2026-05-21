import {
  validateTenantKey,
  authContextFromRequest,
  InvalidTenantKeyError,
} from "@ebecerra/chatbot-saas/auth";
import { resolveConfig, ConfigNotFoundError } from "@ebecerra/chatbot-saas/config";

/**
 * GET /api/v1/config
 *
 * Devuelve la config pública del tenant (campos visibles del widget — greeting,
 * branding, etc.). Útil para que el componente cliente pinte el skeleton antes
 * de enviar el primer mensaje.
 *
 * Auth: X-Tenant-Key
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  let tenant;
  try {
    tenant = await validateTenantKey(
      request.headers.get("x-tenant-key"),
      authContextFromRequest(request, "/api/v1/config")
    );
  } catch (e) {
    if (e instanceof InvalidTenantKeyError) {
      return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
    }
    throw e;
  }

  try {
    const config = await resolveConfig(tenant);
    return Response.json({
      tenant: { slug: tenant.slug, name: tenant.name },
      config: {
        greeting: config.greeting,
        tone: config.tone,
        language: config.language,
        primary_color: config.primary_color,
        position: config.position,
        avatar_url: config.avatar_url,
        bubble_label: config.bubble_label,
      },
    });
  } catch (e) {
    if (e instanceof ConfigNotFoundError) {
      return jsonError(503, "config_not_synced", "Config not yet synced");
    }
    throw e;
  }
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
