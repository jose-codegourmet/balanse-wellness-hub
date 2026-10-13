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
  experimental: {
    // Every admin page is dynamic (it reads the auth cookie), and Next 16
    // caches dynamic pages for 0s by default, so revisiting a page re-ran its
    // server prefetch and showed `loading.tsx` even when React Query already
    // held the data. Keep visited pages for the same 30s as the React Query
    // `staleTime` (`lib/query/client.ts`). Mutations still refresh the data
    // through query invalidation, and `router.refresh()` or a server action
    // that sets cookies (sign-in/out) clears this cache.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
