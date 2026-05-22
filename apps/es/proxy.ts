import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSupabaseSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

// Rutas dentro de /admin que NO requieren sesión activa.
const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/auth/callback"];

// Subdominios funcionales:
//  - chats.ebecerra.es     → API consumida por widgets de chat y webhooks Sanity.
//  - admin.ebecerra.es     → API consumida por proxies admin de cada web cliente.
//  - bookings.ebecerra.es  → API y landings de confirm/cancel del sistema de reservas.
// En estos subdominios solo pasan rutas API; cualquier ruta HTML devuelve 404
// (el matcher ya excluye /api/*, así que aquí cortamos HTML/admin/studio).
const CHATS_HOST_PREFIX = "chats.";
const ADMIN_HOST_PREFIX = "admin.";
const BOOKINGS_HOST_PREFIX = "bookings.";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Host-aware: chats.*, admin.* y bookings.* solo sirven API.
  const host = request.headers.get("host") ?? "";
  if (
    host.startsWith(CHATS_HOST_PREFIX) ||
    host.startsWith(ADMIN_HOST_PREFIX) ||
    host.startsWith(BOOKINGS_HOST_PREFIX)
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Refresh sesión Supabase en cada request (también en rutas públicas, así
  // tras el callback OAuth la cookie ya queda disponible inmediatamente).
  const { response: supabaseResponse, user } =
    await updateSupabaseSession(request);

  // Bloque /admin: gating por sesión + whitelist se valida en el callback.
  if (pathname.startsWith("/admin")) {
    const isPublic = ADMIN_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!user && !isPublic) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
    // Admin no se beneficia del routing i18n — sale directo.
    return supabaseResponse;
  }

  // Resto del sitio: aplica next-intl, copiando las cookies que Supabase
  // pueda haber refrescado en supabaseResponse.
  const intlResponse = intlMiddleware(request);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });
  return intlResponse;
}

export const config = {
  // Excluye: api, studio, playground, next internals, vercel, assets estáticos
  // (piezas-game/, brand/, .well-known/, favicons), y cualquier archivo con extensión.
  // /admin SÍ entra (el middleware hace su propia gating arriba).
  matcher: [
    "/((?!api|studio|playground|_next|_vercel|piezas-game|brand|\\.well-known|.*\\..*).*)",
  ],
};
