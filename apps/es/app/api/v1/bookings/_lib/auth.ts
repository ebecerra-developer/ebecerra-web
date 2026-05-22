import {
  validateBookingTenantKey,
  InvalidBookingTenantKeyError,
} from "@ebecerra/bookings/auth";
import type { BookingTenant } from "@ebecerra/bookings/types";

/**
 * Resuelve el BookingTenant desde el header X-Tenant-Key.
 * Devuelve Response 401 si falla — el caller hace `if (auth instanceof Response) return auth`.
 */
export async function requireTenant(
  request: Request
): Promise<BookingTenant | Response> {
  const key = request.headers.get("x-tenant-key");
  try {
    return await validateBookingTenantKey(key);
  } catch (e) {
    if (e instanceof InvalidBookingTenantKeyError) {
      return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
    }
    throw e;
  }
}

export function jsonError(
  status: number,
  code: string,
  message: string
): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Aplica headers CORS por tenant en la respuesta real (no preflight).
 *
 * Si `allowedOrigins` está vacío (tenant sin lista configurada) abrimos a
 * cualquiera — útil mientras se prueba la integración. En producción cada tenant
 * declara sus orígenes en booking_tenants.allowed_origins (desde Sanity).
 *
 * Para preflight (OPTIONS) usar `corsPreflight()` — no requiere tenant resolution.
 */
export function corsHeaders(
  origin: string | null,
  allowedOrigins: string[]
): Record<string, string> {
  if (allowedOrigins.length === 0) {
    return {
      "Access-Control-Allow-Origin": origin ?? "*",
      Vary: "Origin",
    };
  }
  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      Vary: "Origin",
    };
  }
  return {};
}

/**
 * Respuesta de preflight CORS. Refleja el Origin del request — la auth real
 * (tenant key + allowed_origins) se valida en el GET/POST. Es seguro porque
 * preflight no lleva credenciales ni datos.
 */
export function corsPreflight(request: Request): Response {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin ?? "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Tenant-Key, Authorization",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}
