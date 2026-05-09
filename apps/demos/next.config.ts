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
};

export default withNextIntl(nextConfig);
