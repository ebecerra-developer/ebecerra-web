import { randomBytes, createHash } from "node:crypto";
import { getSupabase } from "../db/client";
import type { BookingTenant } from "../types";

const KEY_BYTES = 32;
const KEY_PREFIX_LEN = 12;

export class InvalidBookingTenantKeyError extends Error {
  constructor(public reason: "missing" | "not_found" | "inactive") {
    super(`Invalid BOOKING_TENANT_KEY: ${reason}`);
  }
}

/**
 * Genera un BOOKING_TENANT_KEY nuevo.
 * Devuelve raw (única vez), hash (a guardar), prefix (para mostrar en /admin).
 */
export function generateBookingTenantKey(): {
  raw: string;
  hash: string;
  prefix: string;
} {
  const raw = `btk_${randomBytes(KEY_BYTES).toString("hex")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, KEY_PREFIX_LEN);
  return { raw, hash, prefix };
}

/**
 * Resuelve un BOOKING_TENANT_KEY raw a su tenant. Throws InvalidBookingTenantKeyError
 * si no existe o está inactivo.
 */
export async function validateBookingTenantKey(
  rawKey: string | null | undefined
): Promise<BookingTenant> {
  if (!rawKey || !rawKey.startsWith("btk_")) {
    throw new InvalidBookingTenantKeyError("missing");
  }
  const hash = createHash("sha256").update(rawKey).digest("hex");

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("booking_tenants")
    .select("*")
    .eq("api_key_hash", hash)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new InvalidBookingTenantKeyError("not_found");
  if (data.status !== "active") throw new InvalidBookingTenantKeyError("inactive");

  return data as BookingTenant;
}

/**
 * Rotación de la key: borra el hash anterior y devuelve el nuevo raw.
 * Usado desde /admin/bookings/tenants/<id>/rotate-key.
 */
export async function rotateBookingTenantKey(
  bookingTenantId: string
): Promise<{ raw: string; prefix: string }> {
  const { raw, hash, prefix } = generateBookingTenantKey();
  const supabase = getSupabase();
  const { error } = await supabase
    .from("booking_tenants")
    .update({ api_key_hash: hash, api_key_prefix: prefix })
    .eq("id", bookingTenantId);
  if (error) throw error;
  return { raw, prefix };
}
