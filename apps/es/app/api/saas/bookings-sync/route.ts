import {
  verifySanityWebhookSignature,
  handleBookingsSyncWebhook,
} from "@ebecerra/bookings/sanity-sync";

/**
 * POST /api/saas/bookings-sync?project=<sanity-project-id>
 *
 * Receptor de webhooks de Sanity para el sistema de reservas. Cuando un cliente
 * publica un documento de tipo bookingTenantConfig o bookingService, este endpoint
 * actualiza las tablas correspondientes en Supabase central.
 *
 * Auth: HMAC-SHA256 del raw body con BOOKINGS_WEBHOOK_SECRET
 *       (header `sanity-webhook-signature`).
 *
 * En Fase 7 este endpoint pasará a vivir en bookings.ebecerra.es (mismo deploy,
 * alias). Mientras tanto, configurar el webhook de Sanity apuntando a:
 *   https://ebecerra.es/api/saas/bookings-sync?project=gdtxcn4l
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const sanityProjectId = url.searchParams.get("project");
  if (!sanityProjectId) {
    return jsonError(400, "missing_project", "?project= query string required");
  }

  const rawBody = await request.text();

  const signatureHeader = request.headers.get("sanity-webhook-signature");
  if (!signatureHeader) {
    return jsonError(401, "missing_auth", "Header sanity-webhook-signature required");
  }
  const secret = process.env.BOOKINGS_WEBHOOK_SECRET;
  if (!secret) {
    return jsonError(500, "config_error", "Server missing BOOKINGS_WEBHOOK_SECRET");
  }
  const valid = verifySanityWebhookSignature({
    rawBody,
    signatureHeader,
    secret,
  });
  if (!valid) {
    return jsonError(401, "invalid_signature", "Webhook signature invalid or expired");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !(payload as { _id?: unknown })._id ||
    !(payload as { _type?: unknown })._type
  ) {
    return jsonError(400, "missing_fields", "Payload must include _id and _type");
  }

  const result = await handleBookingsSyncWebhook({
    sanityProjectId,
    payload: payload as { _id: string; _type: string; _rev?: string },
  });

  if (!result.ok) {
    console.warn("[bookings-sync] skip:", result.reason);
    // 200 para que Sanity no reintente — el skip es esperado mientras el tenant
    // no está provisionado en booking_tenants todavía.
    return Response.json({ ok: false, reason: result.reason }, { status: 200 });
  }

  return Response.json({
    ok: true,
    booking_tenant_id: result.bookingTenantId,
    action: result.action,
  });
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
