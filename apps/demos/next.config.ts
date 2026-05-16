import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // No `trailingSlash: true` — entra en conflicto con file conventions
  // como app/icon.tsx (genera el asset en /icon, pero trailing slash
  // redirige a /icon/ → 404). En apps/demos no tenemos /piezas-game ni
  // similar, así que no hace falta.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  experimental: {
    // Inlinea el CSS crítico en el HTML inicial para sacarlo de la ruta crítica
    // (mismo patrón aplicado en apps/es — ~600 ms de bloqueo de render menos).
    inlineCss: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
  async redirects() {
    // La raíz del subdominio no tiene contenido propio: redirige a la
    // galería del dominio principal (con header/footer/menu de apps/es).
    // Las URLs de demos individuales (/equilibrio, /en/equilibrio, etc.)
    // siguen sirviendo desde apps/demos.
    return [
      {
        source: "/",
        destination: "https://ebecerra.es/ejemplos",
        permanent: true,
      },
      {
        source: "/en",
        destination: "https://ebecerra.es/en/ejemplos",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
