import { nativeProvider } from "@ebecerra/bookings/adapters";
import { requireTenant, corsHeaders, corsPreflight, jsonError } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request): Promise<Response> {
  return corsPreflight(request);
}

/**
 * GET /api/v1/bookings/services
 * Auth: X-Tenant-Key
 *
 * Devuelve catálogo de servicios activos del tenant. Bilingüe — el cliente
 * elige qué locale renderizar.
 */
export async function GET(request: Request): Promise<Response> {
  const tenant = await requireTenant(request);
  if (tenant instanceof Response) return tenant;

  const origin = request.headers.get("origin");
  const cors = corsHeaders(origin, tenant.allowed_origins ?? []);

  const services = await nativeProvider.getServices({
    bookingTenantId: tenant.id,
  });

  return Response.json(
    {
      tenant: {
        slug: tenant.slug,
        name: tenant.name,
        timezone: tenant.timezone,
        currency: tenant.currency,
        default_locale: tenant.default_locale,
        branding_color_primary: tenant.branding_color_primary,
        cancellation_policy: tenant.cancellation_policy,
      },
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        duration_min: s.duration_min,
        price_cents: s.price_cents,
        currency: s.currency,
        color: s.color,
      })),
    },
    { headers: cors }
  );
}

// jsonError importado pero no usado todavía — placeholder para futuras validaciones
void jsonError;
