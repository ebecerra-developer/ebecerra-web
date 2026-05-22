import { nativeProvider } from "@ebecerra/bookings/adapters";
import { requireTenant, corsHeaders, corsPreflight, jsonError } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request): Promise<Response> {
  return corsPreflight(request);
}

/**
 * POST /api/v1/bookings/availability
 * Auth: X-Tenant-Key
 * Body: { service_id: string, from_utc: ISO, to_utc: ISO }
 *
 * Devuelve slots disponibles para el servicio en el rango.
 * Rango máx 60 días para evitar abuso.
 */
export async function POST(request: Request): Promise<Response> {
  const tenant = await requireTenant(request);
  if (tenant instanceof Response) return tenant;
  const origin = request.headers.get("origin");
  const cors = corsHeaders(origin, tenant.allowed_origins ?? []);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: "invalid_json", message: "Body is not JSON" } }),
      { status: 400, headers: { "Content-Type": "application/json", ...cors } }
    );
  }

  const { service_id, from_utc, to_utc } = (body as {
    service_id?: string;
    from_utc?: string;
    to_utc?: string;
  }) ?? {};

  if (!service_id || !from_utc || !to_utc) {
    return withCors(
      jsonError(400, "missing_fields", "service_id, from_utc, to_utc required"),
      cors
    );
  }

  const fromMs = new Date(from_utc).getTime();
  const toMs = new Date(to_utc).getTime();
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs <= fromMs) {
    return withCors(jsonError(400, "invalid_range", "from_utc and to_utc invalid"), cors);
  }
  if (toMs - fromMs > 60 * 24 * 60 * 60 * 1000) {
    return withCors(jsonError(400, "range_too_long", "Max 60 days"), cors);
  }

  const slots = await nativeProvider.getAvailability({
    bookingTenantId: tenant.id,
    serviceId: service_id,
    fromUtc: new Date(fromMs).toISOString(),
    toUtc: new Date(toMs).toISOString(),
  });

  return Response.json(
    { slots, timezone: tenant.timezone },
    { headers: cors }
  );
}

function withCors(res: Response, cors: Record<string, string>): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}
