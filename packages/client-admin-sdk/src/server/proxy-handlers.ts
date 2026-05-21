import { NextResponse } from "next/server";
import { resolveAdminConfig } from "./env";
import { readSession, setSession, clearSession } from "./cookie";

export type HandlerOpts = {
  /** Override del tenantKey. Default: env CHATBOT_TENANT_KEY. */
  tenantKey?: string;
  /** Override del adminApiUrl. Default: env ADMIN_API_URL. */
  adminApiUrl?: string;
  /** Path al que se restringe la cookie de sesión. Default "/" (toda la web). */
  cookiePath?: string;
};

async function forwardToAdmin(
  path: string,
  init: RequestInit,
  opts?: HandlerOpts
): Promise<Response> {
  const { adminApiUrl, tenantKey } = resolveAdminConfig(opts);
  return fetch(`${adminApiUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "X-Tenant-Key": tenantKey,
    },
  });
}

export function buildAuthLoginHandler(opts?: HandlerOpts) {
  return async function POST(request: Request) {
    const body = await request.text();
    const upstream = await forwardToAdmin(
      "/api/auth/send-magic-link",
      { method: "POST", headers: { "Content-Type": "application/json" }, body },
      opts
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  };
}

export function buildAuthVerifyHandler(opts?: HandlerOpts) {
  return async function POST(request: Request) {
    const body = await request.text();
    const upstream = await forwardToAdmin(
      "/api/auth/verify",
      { method: "POST", headers: { "Content-Type": "application/json" }, body },
      opts
    );

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
        { error: { code: "incomplete_upstream" } },
        { status: 502 }
      );
    }

    await setSession(
      {
        email: data.email,
        tenant_id: data.tenant_id,
        tenant_slug: data.tenant_slug,
        role: data.role as "owner" | "editor" | "client",
      },
      { cookiePath: opts?.cookiePath }
    );
    return NextResponse.json({ ok: true, email: data.email, role: data.role });
  };
}

export function buildLogoutHandler(opts?: HandlerOpts) {
  return async function POST() {
    await clearSession({ cookiePath: opts?.cookiePath });
    return NextResponse.json({ ok: true });
  };
}

export function buildAdminProxyHandler(upstreamPath: string, opts?: HandlerOpts) {
  return async function GET(request: Request) {
    const session = await readSession();
    if (!session) {
      return NextResponse.json({ error: { code: "unauthenticated" } }, { status: 401 });
    }
    const url = new URL(request.url);
    const upstream = await forwardToAdmin(
      upstreamPath + url.search,
      { method: "GET", headers: { "X-Actor-Email": session.email } },
      opts
    );
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
 * @param opts.requireTenantId si está, exige que session.tenant_id coincida
 *   (excepto si role es owner/editor — operador cross-tenant).
 */
export async function requireSession(opts?: {
  redirectTo?: string;
  requireTenantId?: string;
}) {
  const session = await readSession();
  const { redirect } = await import("next/navigation");

  if (!session) {
    redirect((opts?.redirectTo ?? "/admin/login") as Parameters<typeof redirect>[0]);
  }

  // Operator (role owner/editor) → cross-tenant OK. Client → debe matchear tenant.
  if (
    opts?.requireTenantId &&
    session!.role === "client" &&
    session!.tenant_id !== opts.requireTenantId
  ) {
    redirect((opts?.redirectTo ?? "/admin/login") as Parameters<typeof redirect>[0]);
  }

  return session!;
}
