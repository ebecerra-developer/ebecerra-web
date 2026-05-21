import {
  validateTenantKey,
  authContextFromRequest,
  InvalidTenantKeyError,
} from "@ebecerra/chatbot-saas/auth";
import { listMessages } from "@ebecerra/chatbot-saas/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  let tenant;
  try {
    tenant = await validateTenantKey(
      request.headers.get("x-tenant-key"),
      authContextFromRequest(request, "/api/admin/chatbot/messages")
    );
  } catch (e) {
    if (e instanceof InvalidTenantKeyError) {
      return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
    }
    throw e;
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session") ?? undefined;
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const limit = parseIntOr(url.searchParams.get("limit"), 50);
  const offset = parseIntOr(url.searchParams.get("offset"), 0);

  const messages = await listMessages({
    tenantId: tenant.id,
    sessionId,
    from,
    to,
    limit,
    offset,
  });
  return Response.json({ messages });
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
