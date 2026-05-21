import {
  validateTenantKey,
  authContextFromRequest,
  InvalidTenantKeyError,
} from "@ebecerra/chatbot-saas/auth";
import { getCurrentUsage, getUsageHistory } from "@ebecerra/chatbot-saas/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  let tenant;
  try {
    tenant = await validateTenantKey(
      request.headers.get("x-tenant-key"),
      authContextFromRequest(request, "/api/admin/chatbot/usage")
    );
  } catch (e) {
    if (e instanceof InvalidTenantKeyError) {
      return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
    }
    throw e;
  }

  const url = new URL(request.url);
  const history = url.searchParams.get("history");

  if (history) {
    const months = Math.min(Math.max(Number.parseInt(history, 10) || 6, 1), 24);
    const rows = await getUsageHistory(tenant.id, months);
    return Response.json({ history: rows, monthly_limit: tenant.monthly_message_limit });
  }

  const usage = await getCurrentUsage(tenant.id);
  return Response.json({
    usage: {
      period_start: usage.period_start,
      conversations_count: usage.conversations_count,
      messages_count: usage.messages_count,
      tokens_total: usage.tokens_total,
      monthly_limit: tenant.monthly_message_limit,
    },
  });
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
