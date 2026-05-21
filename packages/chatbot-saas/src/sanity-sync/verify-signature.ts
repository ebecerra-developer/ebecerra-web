import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifica el signature de un webhook de Sanity.
 *
 * Sanity envía el header `sanity-webhook-signature` con formato:
 *   t=1234567890,v1=<hmac-sha256-hex>
 * donde el HMAC es sobre el raw body con el secret compartido.
 *
 * Referencia: https://www.sanity.io/docs/webhooks
 */
export function verifySanityWebhookSignature(args: {
  rawBody: string;
  signatureHeader: string | null;
  secret: string;
  /** Máximo skew permitido entre t y now (segundos). Default 5 min. */
  toleranceSeconds?: number;
}): boolean {
  if (!args.signatureHeader || !args.secret) return false;

  const parts = Object.fromEntries(
    args.signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;

  const tolerance = args.toleranceSeconds ?? 300;
  const tSec = Number.parseInt(t, 10);
  if (!Number.isFinite(tSec)) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - tSec) > tolerance) return false;

  const expected = createHmac("sha256", args.secret)
    .update(`${t}.${args.rawBody}`)
    .digest("hex");

  const a = Buffer.from(v1, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
