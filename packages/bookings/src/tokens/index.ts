import { randomBytes, createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getSupabase } from "../db/client";
import type { TokenScope } from "../types";

/**
 * Magic link tokens para confirm/cancel del visitante.
 *
 * Cada token tiene tres capas de seguridad:
 *  1. Raw (32 bytes random hex, 64 chars). Solo viaja en el email.
 *  2. SHA-256(raw) → token_hash, lo que se guarda en DB. Un dump de la tabla
 *     no es útil sin el raw.
 *  3. HMAC(raw, BOOKINGS_TOKEN_SECRET) → mac. Va concatenado en el link como
 *     `?token=<raw>.<mac>`. Garantiza que el token salió de nuestro servidor
 *     incluso si alguien adivina el raw.
 *
 * Formato del token en el link: `<raw-hex>.<mac-hex>`
 */

const RAW_BYTES = 32;
const MAC_HEX_LENGTH = 64; // SHA-256 hex

export interface IssuedToken {
  /** Token completo `<raw>.<mac>` que va en el email. */
  signed: string;
  /** SHA-256(raw) en hex. Lo que se persiste en booking_tokens.token_hash. */
  hash: string;
}

function getSecret(): string {
  const s = process.env.BOOKINGS_TOKEN_SECRET;
  if (!s) throw new Error("BOOKINGS_TOKEN_SECRET not set");
  return s;
}

function macOf(raw: string): string {
  return createHmac("sha256", getSecret()).update(raw).digest("hex");
}

function hashOf(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Genera un par (signed, hash). Persiste el hash en booking_tokens.
 * Devuelve el signed para meterlo en el link del email.
 */
export async function issueToken(args: {
  bookingId: string;
  scope: TokenScope;
  expiresAt: Date;
}): Promise<IssuedToken> {
  const raw = randomBytes(RAW_BYTES).toString("hex");
  const mac = macOf(raw);
  const hash = hashOf(raw);

  const supabase = getSupabase();
  const { error } = await supabase.from("booking_tokens").insert({
    token_hash: hash,
    booking_id: args.bookingId,
    scope: args.scope,
    expires_at: args.expiresAt.toISOString(),
  });
  if (error) throw error;

  return { signed: `${raw}.${mac}`, hash };
}

export type ValidateError =
  | "malformed"
  | "bad_signature"
  | "not_found"
  | "expired"
  | "used"
  | "wrong_scope";

export interface ValidateOk {
  ok: true;
  bookingId: string;
  tokenId: string;
}

export interface ValidateFail {
  ok: false;
  reason: ValidateError;
}

/**
 * Valida un token signed y lo marca como usado de forma atómica.
 * Devuelve booking_id si OK.
 *
 * Single-use: si el token ya estaba marcado como usado, falla con "used".
 */
export async function consumeToken(args: {
  signedToken: string;
  expectedScope: TokenScope;
}): Promise<ValidateOk | ValidateFail> {
  const parts = args.signedToken.split(".");
  if (parts.length !== 2 || parts[0].length !== RAW_BYTES * 2 || parts[1].length !== MAC_HEX_LENGTH) {
    return { ok: false, reason: "malformed" };
  }
  const [raw, mac] = parts;

  const expectedMac = macOf(raw);
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(expectedMac, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  const hash = hashOf(raw);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("booking_tokens")
    .select("id, booking_id, scope, expires_at, used_at")
    .eq("token_hash", hash)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ok: false, reason: "not_found" };

  if (data.scope !== args.expectedScope) {
    return { ok: false, reason: "wrong_scope" };
  }
  if (data.used_at) {
    return { ok: false, reason: "used" };
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  // Mark as used. Race-safe via WHERE used_at IS NULL.
  const { data: claimed, error: claimErr } = await supabase
    .from("booking_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", data.id)
    .is("used_at", null)
    .select("id")
    .maybeSingle();
  if (claimErr) throw claimErr;
  if (!claimed) return { ok: false, reason: "used" };

  return { ok: true, bookingId: data.booking_id, tokenId: data.id };
}
