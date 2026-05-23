import { createHash } from "node:crypto";
import { getSupabase } from "@ebecerra/bookings/db";
import { nativeProvider } from "@ebecerra/bookings/adapters/native";
import { corsPreflight } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req: Request): Promise<Response> {
  return corsPreflight(req);
}

/**
 * GET /api/v1/bookings/by-token?token=<signed>
 *
 * Resuelve el tenant + catálogo + booking actual desde un manage token sin
 * consumirlo. Lo usa el widget en modo reschedule para cargar servicios y
 * disponibilidad sin necesidad de tenant key pública.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const signed = url.searchParams.get("token");
  if (!signed) return jsonError(400, "missing_token", "token required");

  const parts = signed.split(".");
  if (parts.length !== 2) return jsonError(400, "malformed", "Invalid token");
  const hash = createHash("sha256").update(parts[0]).digest("hex");

  const supabase = getSupabase();
  const { data: tok } = await supabase
    .from("booking_tokens")
    .select("booking_id, scope, expires_at, used_at")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!tok) return jsonError(404, "not_found", "Token not found");
  if (tok.used_at) return jsonError(410, "used", "Token already used");
  if (new Date(tok.expires_at).getTime() < Date.now()) {
    return jsonError(410, "expired", "Token expired");
  }
  if (tok.scope !== "manage" && tok.scope !== "cancel") {
    return jsonError(400, "wrong_scope", "Token scope not manage");
  }

  // Cargar booking + tenant.
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", tok.booking_id)
    .maybeSingle();
  if (!booking) return jsonError(404, "not_found", "Booking not found");

  const tenant = await nativeProvider.getTenant({
    bookingTenantId: booking.booking_tenant_id,
  });
  const services = await nativeProvider.getServices({
    bookingTenantId: booking.booking_tenant_id,
  });

  return Response.json(
    {
      booking: {
        id: booking.id,
        service_id: booking.service_id,
        slot_start_utc: booking.slot_start_utc,
        status: booking.status,
        locale: booking.locale,
      },
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
    {
      headers: {
        "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
        Vary: "Origin",
      },
    }
  );
}

/**
 * POST /api/v1/bookings/by-token (availability via token)
 * Body: { token, service_id, from_utc, to_utc }
 *
 * Devuelve slots disponibles para reagendar, autenticado por manage token.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!body || !body.token || !body.service_id || !body.from_utc || !body.to_utc) {
    return jsonError(400, "missing_fields", "token, service_id, from_utc, to_utc required");
  }
  const hash = createHash("sha256")
    .update(String(body.token).split(".")[0] ?? "")
    .digest("hex");

  const supabase = getSupabase();
  const { data: tok } = await supabase
    .from("booking_tokens")
    .select("booking_id, scope, expires_at, used_at")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!tok || tok.used_at || new Date(tok.expires_at).getTime() < Date.now()) {
    return jsonError(401, "invalid_token", "Invalid token");
  }
  if (tok.scope !== "manage" && tok.scope !== "cancel") {
    return jsonError(400, "wrong_scope", "Token scope not manage");
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("booking_tenant_id, slot_start_utc, slot_end_utc")
    .eq("id", tok.booking_id)
    .maybeSingle();
  if (!booking) return jsonError(404, "not_found", "Booking not found");

  const slots = await nativeProvider.getAvailability({
    bookingTenantId: booking.booking_tenant_id,
    serviceId: body.service_id,
    fromUtc: body.from_utc,
    toUtc: body.to_utc,
  });

  // Importante: el slot de la booking actual también está libre desde el punto
  // de vista del cliente (lo va a liberar al reagendar). Lo añadimos manualmente
  // si la availability no lo incluye.
  const currentStart = booking.slot_start_utc;
  if (!slots.find((s) => s.start === currentStart)) {
    slots.push({
      start: currentStart,
      end: booking.slot_end_utc,
    });
    slots.sort((a, b) => a.start.localeCompare(b.start));
  }

  return Response.json(
    { slots },
    {
      headers: {
        "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
        Vary: "Origin",
      },
    }
  );
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(
    JSON.stringify({ ok: false, error: { code, message } }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}
