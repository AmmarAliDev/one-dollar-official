import type { NextConfig } from "next";

import { getSecurityHeaders, getServerActionAllowedOrigins } from "./src/config/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: getServerActionAllowedOrigins(),
      bodySizeLimit: "1mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: getSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
