import {
  validateTenantKey,
  authContextFromRequest,
  InvalidTenantKeyError,
} from "@ebecerra/chatbot-saas/auth";
import { listSessions } from "@ebecerra/chatbot-saas/db";

/**
 * GET /api/admin/chatbot/sessions
 *
 * Variante admin de /api/v1/sessions. Misma auth (X-Tenant-Key), pero también espera
 * X-Actor-Email del proxy de la web cliente (audit).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  let tenant;
  try {
    tenant = await validateTenantKey(
      request.headers.get("x-tenant-key"),
      authContextFromRequest(request, "/api/admin/chatbot/sessions")
    );
  } catch (e) {
    if (e instanceof InvalidTenantKeyError) {
      return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
    }
    throw e;
  }

  const url = new URL(request.url);
  const limit = Math.min(parseIntOr(url.searchParams.get("limit"), 50), 200);
  const sessions = await listSessions(tenant.id, { limit });
  return Response.json({ sessions });
}

function parseIntOr(v: string | null, fallback: number): number {
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
