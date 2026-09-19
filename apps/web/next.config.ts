import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@balanse/api",
    "@balanse/ui",
    "@balanse/domain",
    "@balanse/mock",
    "@balanse/config",
    "@balanse/db",
  ],
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
