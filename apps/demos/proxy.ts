import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // /admin no usa i18n (interno, ES-only, multi-tenant por slug).
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  return intlMiddleware(request);
}

export const config = {
  // Excluye: api, next internals, vercel, .well-known, file conventions
  // sin extension (icon, apple-icon — generados por app/icon.tsx y
  // app/apple-icon.tsx), y cualquier ruta con extension (favicons,
  // sitemap.xml, robots.txt, manifest.json, etc.).
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|\\.well-known|.*\\..*).*)",
  ],
};
