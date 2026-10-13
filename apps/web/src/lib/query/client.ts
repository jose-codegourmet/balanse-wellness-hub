import { QueryClient } from "@tanstack/react-query";

// Keep a short stale window to avoid redundant API reads during navigation.
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 0, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  });
}
