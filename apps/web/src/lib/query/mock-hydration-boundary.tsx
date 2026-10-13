"use client";

import { type DehydratedState, HydrationBoundary, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useMemo } from "react";

/**
 * Mock mode: the server and browser hold separate adapter singletons, and the
 * server always dehydrates pristine fixtures. A soft navigation re-runs the
 * route prefetch with a newer `dataUpdatedAt`, so a plain `HydrationBoundary`
 * would overwrite client mutations. Only seed queries the browser has no data
 * for yet; once cached, the browser adapter is authoritative.
 */
export function MockHydrationBoundary({
  state,
  children,
}: {
  state: DehydratedState;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const filtered = useMemo<DehydratedState>(() => {
    const cache = queryClient.getQueryCache();
    return {
      ...state,
      queries: state.queries.filter(
        (query) => cache.find({ queryKey: query.queryKey, exact: true })?.state.data === undefined,
      ),
    };
  }, [queryClient, state]);
  return <HydrationBoundary state={filtered}>{children}</HydrationBoundary>;
}
