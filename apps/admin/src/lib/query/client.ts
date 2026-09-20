import { QueryClient } from "@tanstack/react-query";

// Mock mode: the adapter is an in-memory singleton, so a non-zero staleTime is
// what actually demonstrates caching (a 0 staleTime would refetch on every mount
// and look identical to the useEffect code this layer replaces). retry stays 0
// because `MockRuntimeOptions.failNext` is a one-shot flag — retrying would
// silently swallow the failure the harness is trying to demonstrate.
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 0, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  });
}
