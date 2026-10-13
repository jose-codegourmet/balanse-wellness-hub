import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@balanse/api",
    "@balanse/api-client",
    "@balanse/ui",
    "@balanse/domain",
    "@balanse/config",
    "@balanse/db",
  ],
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
