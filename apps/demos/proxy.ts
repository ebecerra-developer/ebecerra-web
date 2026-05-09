import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Excluye: api, next internals, vercel, .well-known, file conventions
  // sin extension (icon, apple-icon — generados por app/icon.tsx y
  // app/apple-icon.tsx), y cualquier ruta con extension (favicons,
  // sitemap.xml, robots.txt, manifest.json, etc.).
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|\\.well-known|.*\\..*).*)",
  ],
};
