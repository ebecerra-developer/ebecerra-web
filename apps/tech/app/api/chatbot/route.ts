import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chatbot
 *
 * Proxy server-side al backend SaaS centralizado (chats.ebecerra.es).
 * Inyecta el tenant key del env var (apps-tech) y pasa el body tal cual.
 *
 * El widget cliente desconoce tanto la URL del backend como la clave.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const apiUrl = process.env.CHATBOT_API_URL;
  const tenantKey = process.env.CHATBOT_TENANT_KEY;

  if (!apiUrl || !tenantKey) {
    return NextResponse.json(
      { message: "Chatbot not configured (missing CHATBOT_API_URL or CHATBOT_TENANT_KEY)" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const referer = request.headers.get("referer");

  const upstream = await fetch(`${apiUrl}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Key": tenantKey,
      ...(referer ? { Referer: referer } : {}),
    },
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
