import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@balanse/api",
    "@balanse/api-client",
    "@balanse/ui",
    "@balanse/domain",
    "@balanse/config",
  ],
};

export default nextConfig;
