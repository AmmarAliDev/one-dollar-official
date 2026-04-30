import type { NextConfig } from "next";

import { getSecurityHeaders, getServerActionAllowedOrigins } from "./src/config/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86_400,
    remotePatterns: [
      // Admin/content uploads are stored in Vercel Blob in all environments.
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      // Local/dev demo catalog seeding uses placeholder remote images for realistic test data.
      // Keep this allowlist narrow to the exact hosts referenced by prisma/dev-catalog-data.js.
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
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
