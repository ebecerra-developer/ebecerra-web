import { type NextRequest, NextResponse } from "next/server";
import { handleChatRequest } from "@ebecerra/chatbot-saas/chat";

/**
 * POST /api/chatbot
 *
 * Proxy del widget de ebecerra.es al handler SaaS centralizado.
 *
 * apps/es es a la vez backend (chats.ebecerra.es) y cliente — invocamos
 * `handleChatRequest` directamente in-process en lugar de hacer un round-trip
 * HTTP a `chats.ebecerra.es/api/v1/chat`. Inyectamos `X-Tenant-Key` server-side
 * (env var `CHATBOT_TENANT_KEY`) para que el handler valide y resuelva al
 * tenant `apps-es`. La clave nunca toca el cliente.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  const tenantKey = process.env.CHATBOT_TENANT_KEY;

  if (!tenantKey) {
    return NextResponse.json(
      { message: "Chatbot not configured (missing CHATBOT_TENANT_KEY)" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const headers = new Headers(request.headers);
  headers.set("X-Tenant-Key", tenantKey);

  const proxied = new Request(request.url, {
    method: "POST",
    headers,
    body,
  });

  return handleChatRequest(proxied);
}
