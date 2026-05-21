import { createHmac, timingSafeEqual } from "node:crypto";
import { getClientAdminEnv } from "./env";
import type { SessionPayload } from "../types";

const SESSION_TTL_DAYS = 7;

function base64urlEncode(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Buffer.from(padded, "base64");
}

function sign(payloadJson: string, secret: string): string {
  return base64urlEncode(createHmac("sha256", secret).update(payloadJson).digest());
}

/**
 * Firma la sesión: <payload-b64>.<signature-b64>
 * Payload incluye exp en epoch seconds.
 */
export function signSession(
  payload: Omit<SessionPayload, "exp">,
  ttlDays = SESSION_TTL_DAYS
): { token: string; exp: number } {
  const env = getClientAdminEnv();
  const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60;
  const full: SessionPayload = { ...payload, exp };
  const json = JSON.stringify(full);
  const encoded = base64urlEncode(json);
  const sig = sign(json, env.sessionSecret);
  return { token: `${encoded}.${sig}`, exp };
}

export class InvalidSessionError extends Error {
  constructor(public reason: "malformed" | "bad_signature" | "expired") {
    super(`Invalid session: ${reason}`);
    this.name = "InvalidSessionError";
  }
}

/**
 * Valida y decodifica una sesión. Lanza InvalidSessionError si malformada/firma mala/expirada.
 */
export function verifySession(token: string): SessionPayload {
  const env = getClientAdminEnv();
  const parts = token.split(".");
  if (parts.length !== 2) throw new InvalidSessionError("malformed");
  const [payloadB64, sigB64] = parts;
  let payloadJson: string;
  try {
    payloadJson = base64urlDecode(payloadB64).toString("utf8");
  } catch {
    throw new InvalidSessionError("malformed");
  }

  const expectedSig = sign(payloadJson, env.sessionSecret);
  const a = Buffer.from(sigB64);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new InvalidSessionError("bad_signature");
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(payloadJson) as SessionPayload;
  } catch {
    throw new InvalidSessionError("malformed");
  }

  if (payload.exp * 1000 < Date.now()) {
    throw new InvalidSessionError("expired");
  }
  return payload;
}

export function getSessionTtlSeconds(): number {
  return SESSION_TTL_DAYS * 24 * 60 * 60;
}
