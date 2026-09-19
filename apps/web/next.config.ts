import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@balanse/ui", "@balanse/domain", "@balanse/mock", "@balanse/config"],
};

export default nextConfig;
