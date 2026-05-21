import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware host-aware.
 *
 * apps/es responde a dos dominios:
 *  - ebecerra.es (portfolio + admin + studio + API legacy)
 *  - chats.ebecerra.es (solo API del chatbot SaaS — /api/v1/* y /api/saas/*)
 *
 * Si el host es chats.*, bloqueamos cualquier ruta que no sea API del chatbot.
 * Si es ebecerra.es (o cualquier otro), pasamos sin tocar nada.
 *
 * i18n: next-intl está configurado con localePrefix=as-needed y route group
 * [locale] dinámico, sin middleware. No interferimos.
 */

const CHATS_HOST_PREFIX = "chats.";

const CHATS_ALLOWED_PATHS = [
  "/api/v1/",
  "/api/saas/",
];

export default function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const isChatsSubdomain = host.startsWith(CHATS_HOST_PREFIX);

  if (isChatsSubdomain) {
    const pathname = req.nextUrl.pathname;
    const allowed = CHATS_ALLOWED_PATHS.some((p) => pathname.startsWith(p));
    if (!allowed) {
      return new NextResponse("Not Found", { status: 404 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Excluir assets estáticos y archivos con extensión.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
