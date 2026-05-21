import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  validateTenantKey,
  authContextFromRequest,
  verifyMagicLink,
  InvalidTenantKeyError,
  MagicLinkError,
} from "@ebecerra/chatbot-saas/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  token: z.string().min(20).max(200),
});

/**
 * POST /api/auth/verify
 *
 * Auth: X-Tenant-Key
 * Body: { token }
 *
 * Devuelve { email, tenant_id, role } si el token es válido. El cliente proxy lo usa
 * para firmar su propia cookie JWT local con SESSION_SECRET.
 */
export async function POST(request: NextRequest) {
  let tenant;
  try {
    tenant = await validateTenantKey(
      request.headers.get("x-tenant-key"),
      authContextFromRequest(request, "/api/auth/verify")
    );
  } catch (e) {
    if (e instanceof InvalidTenantKeyError) {
      return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
    }
    throw e;
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body must be JSON");
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(400, "invalid_payload", "token field required");
  }

  try {
    const { email, role } = await verifyMagicLink({
      token: parsed.data.token,
      tenant,
    });
    return NextResponse.json({
      email,
      role,
      tenant_id: tenant.id,
      tenant_slug: tenant.slug,
    });
  } catch (e) {
    if (e instanceof MagicLinkError) {
      return jsonError(e.statusCode, e.code, e.message);
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
