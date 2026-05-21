import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import {
  validateTenantKey,
  authContextFromRequest,
  requestMagicLink,
  InvalidTenantKeyError,
  MagicLinkError,
} from "@ebecerra/chatbot-saas/auth";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  email: z.email(),
});

/**
 * POST /api/auth/send-magic-link
 *
 * Auth: X-Tenant-Key (server-to-server desde el /api/auth proxy de la web cliente).
 * Body: { email }
 *
 * Flujo:
 *  - Verifica tenant key
 *  - Genera magic link token + envía email vía Resend con URL hacia admin_base_url/admin/verify?token=…
 *  - Si el email no está autorizado, devuelve OK silencioso (no filtra existencia)
 */
export async function POST(request: NextRequest) {
  let tenant;
  try {
    tenant = await validateTenantKey(
      request.headers.get("x-tenant-key"),
      authContextFromRequest(request, "/api/auth/send-magic-link")
    );
  } catch (e) {
    if (e instanceof InvalidTenantKeyError) {
      return jsonError(401, "unauthorized", `Invalid tenant key (${e.reason})`);
    }
    throw e;
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body must be JSON");
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(400, "invalid_payload", "email field required");
  }
  const { email } = parsed.data;

  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    return jsonError(503, "auth_disabled", "Resend not configured");
  }

  let result;
  try {
    result = await requestMagicLink({
      email,
      tenant,
      ip:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    });
  } catch (e) {
    if (e instanceof MagicLinkError) {
      return jsonError(e.statusCode, e.code, e.message);
    }
    throw e;
  }

  // No-op silencioso si el email no está autorizado — devolvemos ok sin enviar
  if (!result.sent || !result.verifyUrl) {
    return NextResponse.json({ ok: true });
  }

  const fromAddress = env.CONTACT_FROM_EMAIL ?? "no-reply@ebecerra.es";
  const resend = new Resend(env.RESEND_API_KEY);

  const subject = `Acceso al admin de ${tenant.name}`;
  const html = renderMagicLinkEmail({
    tenantName: tenant.name,
    verifyUrl: result.verifyUrl,
  });

  try {
    const { error } = await resend.emails.send({
      from: `${tenant.name} · admin <${fromAddress}>`,
      to: [email],
      subject,
      html,
    });
    if (error) {
      console.error("[magic-link] Resend error:", error);
      return jsonError(503, "send_failed", "Email send failed");
    }
  } catch (err) {
    console.error("[magic-link] Resend exception:", err);
    return jsonError(503, "send_failed", "Email send failed");
  }

  return NextResponse.json({ ok: true });
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderMagicLinkEmail(args: { tenantName: string; verifyUrl: string }): string {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#fafaf9; padding:32px 16px; color:#1c1917;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <h1 style="margin: 0 0 16px; font-size: 20px;">Acceso al admin de ${escapeHtml(args.tenantName)}</h1>
    <p style="margin: 0 0 24px; line-height: 1.55; color:#44403c;">
      Pulsa el botón para acceder. El enlace caduca en <strong>15 minutos</strong> y solo se puede usar una vez.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${args.verifyUrl}" style="display:inline-block; background:#047857; color:white; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600;">Entrar al admin</a>
    </p>
    <p style="margin: 0; font-size: 12px; color:#78716c; line-height: 1.55;">
      Si no has solicitado este acceso, puedes ignorar este email.
      Enlace directo:<br />
      <span style="word-break: break-all; font-family: monospace; font-size: 11px;">${args.verifyUrl}</span>
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
