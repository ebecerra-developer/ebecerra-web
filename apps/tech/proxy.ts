import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // /admin no usa i18n (es interno, ES-only).
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|studio|playground|_next|_vercel|piezas-game|brand|\\.well-known|.*\\..*).*)",
  ],
};
