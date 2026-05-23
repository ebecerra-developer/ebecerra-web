import { nativeProvider, isSlotTaken } from "@ebecerra/bookings/adapters/native";
import { sendPendingEmail } from "@ebecerra/bookings/email";
import { requireTenant, corsHeaders, corsPreflight, jsonError } from "../_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request): Promise<Response> {
  return corsPreflight(request);
}

/**
 * POST /api/v1/bookings/create
 * Auth: X-Tenant-Key
 * Body: {
 *   service_id: string,
 *   slot_start_utc: ISO,
 *   contact: { name, email, phone?, notes? },
 *   locale?: 'es' | 'en'
 * }
 *
 * Crea la reserva en estado pending y dispara email de confirmación.
 * Devuelve booking público sin los tokens (esos van solo en el email).
 *
 * En Fase 4 esta route invocará el envío del email de confirmación.
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
    return withCors(jsonError(400, "invalid_json", "Body is not JSON"), cors);
  }

  const { service_id, slot_start_utc, contact, locale } = (body as {
    service_id?: string;
    slot_start_utc?: string;
    contact?: {
      name?: string;
      email?: string;
      phone?: string;
      notes?: string;
    };
    locale?: string;
  }) ?? {};

  if (!service_id || !slot_start_utc || !contact?.name || !contact?.email) {
    return withCors(
      jsonError(
        400,
        "missing_fields",
        "service_id, slot_start_utc, contact.name, contact.email required"
      ),
      cors
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email)) {
    return withCors(jsonError(400, "invalid_email", "contact.email invalid"), cors);
  }
  if (contact.name.length > 120) {
    return withCors(jsonError(400, "name_too_long", "contact.name max 120 chars"), cors);
  }
  if (contact.notes && contact.notes.length > 2000) {
    return withCors(jsonError(400, "notes_too_long", "contact.notes max 2000 chars"), cors);
  }

  try {
    const created = await nativeProvider.createBooking({
      bookingTenantId: tenant.id,
      serviceId: service_id,
      slotStartUtc: slot_start_utc,
      contact: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        notes: contact.notes,
      },
      locale: locale ?? tenant.default_locale,
    });

    // Envío del email "pendiente de confirmación".
    try {
      await sendPendingEmail({
        bookingId: created.bookingId,
        confirmSignedToken: created.confirmToken,
        manageSignedToken: created.cancelToken, // adapter aún expone `cancelToken` por compat
      });
    } catch (e) {
      console.error("[bookings/create] sendPendingEmail failed:", e);
    }

    return Response.json(
      {
        booking_id: created.bookingId,
        slot_start_utc: created.slotStartUtc,
        slot_end_utc: created.slotEndUtc,
        status: created.status,
      },
      { status: 201, headers: cors }
    );
  } catch (e) {
    if (isSlotTaken(e)) {
      return withCors(jsonError(409, "slot_taken", "That slot was just taken"), cors);
    }
    if (e instanceof Error) {
      return withCors(jsonError(400, "bad_request", e.message), cors);
    }
    throw e;
  }
}

function withCors(res: Response, cors: Record<string, string>): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}
