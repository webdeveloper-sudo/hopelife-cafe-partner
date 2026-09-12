import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  async rewrites() {
    return [
      {
        source: "/refer/:partnerId",
        destination: "/p/:partnerId",
      },
    ];
  },
};

export default nextConfig;

