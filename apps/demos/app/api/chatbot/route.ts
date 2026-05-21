import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chatbot
 *
 * Proxy server-side al backend SaaS centralizado (chats.ebecerra.es).
 *
 * Routing por demoSlug: cada demoSite tiene su propio tenant (personalidad
 * diferenciada). Lee demoSlug del body y selecciona la tenant key correspondiente.
 *
 * Para añadir un demoSite nuevo:
 *  1. Provisionar tenant en Supabase con sanity_document_id = el UUID del demoSite.
 *  2. Generar tenant key y añadir env var CHATBOT_TENANT_KEY_<SLUG_UPPER>.
 *  3. Añadir entry al map de abajo.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TENANT_KEY_BY_DEMO: Record<string, string | undefined> = {
  equilibrio:        process.env.CHATBOT_TENANT_KEY_EQUILIBRIO,
  "marta-solana":    process.env.CHATBOT_TENANT_KEY_MARTA_SOLANA,
  "claudia-entrena": process.env.CHATBOT_TENANT_KEY_CLAUDIA_ENTRENA,
  eco:               process.env.CHATBOT_TENANT_KEY_ECO,
};

export async function POST(request: NextRequest) {
  const apiUrl = process.env.CHATBOT_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { message: "Chatbot not configured (missing CHATBOT_API_URL)" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();

  let parsed: { demoSlug?: unknown };
  try {
    parsed = JSON.parse(rawBody) as { demoSlug?: unknown };
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const demoSlug =
    typeof parsed.demoSlug === "string" ? parsed.demoSlug : null;
  if (!demoSlug) {
    return NextResponse.json(
      { message: "demoSlug required in body" },
      { status: 400 }
    );
  }

  const tenantKey = TENANT_KEY_BY_DEMO[demoSlug];
  if (!tenantKey) {
    return NextResponse.json(
      { message: `No tenant configured for demoSlug "${demoSlug}"` },
      { status: 404 }
    );
  }

  const referer = request.headers.get("referer");

  const upstream = await fetch(`${apiUrl}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Key": tenantKey,
      ...(referer ? { Referer: referer } : {}),
    },
    body: rawBody,
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
