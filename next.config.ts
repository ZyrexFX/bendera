import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/amckenna41/iso3166-flags/**",
      },
    ],
  },
};

export default nextConfig;
