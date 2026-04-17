import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/piezas-game",
        destination: "/piezas-game/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
