import { buildAdminProxyHandler } from "@ebecerra/client-admin-sdk/server";
import { resolveTenantKey } from "../../../../_lib/tenant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tenantKey = resolveTenantKey(slug);
  if (!tenantKey) {
    return new Response(JSON.stringify({ error: { code: "unknown_tenant" } }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const handler = buildAdminProxyHandler("/api/admin/chatbot/messages", {
    tenantKey,
  });
  return handler(request);
}
