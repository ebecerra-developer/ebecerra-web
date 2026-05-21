import { NextResponse } from "next/server";
import { getClientAdminEnv } from "./env";
import { readSession, setSession, clearSession } from "./cookie";

type AuthAction = "send-magic-link" | "verify";

async function forwardToAdmin(
  path: string,
  init: RequestInit
): Promise<Response> {
  const env = getClientAdminEnv();
  const upstream = await fetch(`${env.adminApiUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "X-Tenant-Key": env.tenantKey,
    },
  });
  return upstream;
}

/**
 * Handler de POST /api/auth/login (alias del send-magic-link en backend).
 * Body: { email }. Devuelve { ok: true } siempre — no filtra existencia.
 */
export function buildAuthLoginHandler() {
  return async function POST(request: Request) {
    const body = await request.text();
    const upstream = await forwardToAdmin("/api/auth/send-magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  };
}

/**
 * Handler de POST /api/auth/verify.
 * Body: { token }. Si OK, firma cookie de sesión local y devuelve { ok: true, role }.
 */
export function buildAuthVerifyHandler() {
  return async function POST(request: Request) {
    const body = await request.text();
    const upstream = await forwardToAdmin("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!upstream.ok) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    let data: { email?: string; tenant_id?: string; tenant_slug?: string; role?: string };
    try {
      data = (await upstream.json()) as typeof data;
    } catch {
      return NextResponse.json({ error: { code: "bad_upstream" } }, { status: 502 });
    }

    if (!data.email || !data.tenant_id || !data.role) {
      return NextResponse.json(
        { error: { code: "incomplete_upstream", message: "Missing fields in upstream response" } },
        { status: 502 }
      );
    }

    await setSession({
      email: data.email,
      tenant_id: data.tenant_id,
      tenant_slug: data.tenant_slug,
      role: data.role as "owner" | "editor" | "client",
    });

    return NextResponse.json({ ok: true, email: data.email, role: data.role });
  };
}

/**
 * Handler de POST /api/auth/logout. Limpia la cookie local. No-op upstream.
 */
export function buildLogoutHandler() {
  return async function POST() {
    await clearSession();
    return NextResponse.json({ ok: true });
  };
}

/**
 * Handler de GET para proxies admin. Verifica sesión local + forwardea al backend.
 *
 * Si no hay sesión válida, 401. Si sesión OK, llama admin.ebecerra.es/{upstreamPath}
 * con X-Tenant-Key + X-Actor-Email (audit).
 */
export function buildAdminProxyHandler(upstreamPath: string) {
  return async function GET(request: Request) {
    const session = await readSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: "unauthenticated", message: "No valid session" } },
        { status: 401 }
      );
    }

    // Preserve query string
    const url = new URL(request.url);
    const upstreamUrl = upstreamPath + url.search;

    const upstream = await forwardToAdmin(upstreamUrl, {
      method: "GET",
      headers: {
        "X-Actor-Email": session.email,
      },
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  };
}

/**
 * Guard para Server Components: comprueba sesión, redirige a /admin/login si no hay.
 *
 * Cast a Parameters<typeof redirect>[0]: Next 16 con typedRoutes solo acepta
 * literales conocidos; al ser SDK reusable con redirectTo configurable, casteamos
 * para que cualquier ruta del consumidor sea válida.
 */
export async function requireSession(opts?: { redirectTo?: string }) {
  const session = await readSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect(
      (opts?.redirectTo ?? "/admin/login") as Parameters<typeof redirect>[0]
    );
  }
  return session!;
}
