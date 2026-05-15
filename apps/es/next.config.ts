import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // trailingSlash: true hace que Next.js redirija /foo → /foo/ en lugar de
  // /foo/ → /foo (comportamiento por defecto). Necesario para que /piezas-game/
  // sea la URL canónica y los assets relativos (styles.css, assets/) resuelvan bien.
  trailingSlash: true,

  // Evita que Turbopack bundle sanity/studio server-side (usan browser APIs)
  serverExternalPackages: ["sanity", "@sanity/ui", "@sanity/vision"],

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
