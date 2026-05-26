import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname_ = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // trailingSlash: true hace que Next.js redirija /foo → /foo/ en lugar de
  // /foo/ → /foo (comportamiento por defecto). Necesario para que /piezas-game/
  // sea la URL canónica y los assets relativos (styles.css, assets/) resuelvan bien.
  trailingSlash: true,

  // Evita que Turbopack bundle sanity/studio server-side (usan browser APIs)
  serverExternalPackages: ["sanity", "@sanity/ui", "@sanity/vision"],

  // Las plantillas del Generador Social viven en <repo>/social-templates/.
  // Next.js debe incluirlas en el bundle serverless para que las route handlers
  // del admin las puedan leer en runtime.
  outputFileTracingRoot: path.join(__dirname_, "..", ".."),
  outputFileTracingIncludes: {
    // Cubrimos tanto la página índice (sin sufijo) como las anidadas.
    "/admin/social": [
      "../../social-templates/**/*.json",
      "../../social-templates/**/*.html",
      "../../social-templates/*.mjs",
    ],
    "/admin/social/**": [
      "../../social-templates/**/*.json",
      "../../social-templates/**/*.html",
      "../../social-templates/*.mjs",
    ],
    "/api/admin/social/**": [
      "../../social-templates/**/*.json",
      "../../social-templates/**/*.html",
      "../../social-templates/*.mjs",
    ],
  },

  images: {
    remotePatterns: [
      // Sanity asset CDN — covers de posts, imágenes inline, OG, etc.
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
    ],
  },

  experimental: {
    // Inlinea el CSS crítico en el HTML inicial para sacarlo de la ruta crítica
    // (PSI marcaba ~600 ms de bloqueo por dos chunks .css).
    inlineCss: true,
  },

  async rewrites() {
    return [
      // Next.js no sirve index.html como índice de directorio automáticamente.
      { source: "/piezas-game/", destination: "/piezas-game/index.html" },
    ];
  },

  async redirects() {
    return [
      // Sitio antiguo estático tenía /index.html, /en/index.html, etc.
      // Google los sigue rastreando y reporta 404 en Search Console.
      // 301 → root preserva link equity y limpia el reporte de GSC.
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/:locale/index.html", destination: "/:locale", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
