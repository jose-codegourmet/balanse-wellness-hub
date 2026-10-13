import { dehydrate, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { makeQueryClient } from "./client";
import { MockHydrationBoundary } from "./mock-hydration-boundary";

type Prefetchable = Parameters<QueryClient["prefetchQuery"]>[0];
type PrefetchInfinite = Parameters<QueryClient["prefetchInfiniteQuery"]>[0];

function isInfiniteQueryOptions(option: object): option is PrefetchInfinite {
  return "getNextPageParam" in option;
}

/**
 * Server-only helper. Creates a fresh QueryClient per request — never cache a
 * client at module scope (cross-request bleed).
 *
 * Signature mirrors admin's `prefetchAdmin(options, children)` (#356
 * WIRE-0105). Wide parameter type so a route can pass mixed `queryOptions`
 * and infinite-query factories (`getNextPageParam` → `prefetchInfiniteQuery`).
 */
export async function prefetchWeb(options: readonly object[], children: ReactNode) {
  const client = makeQueryClient();
  await Promise.all(
    options.map((option) =>
      isInfiniteQueryOptions(option)
        ? client.prefetchInfiniteQuery(option)
        : client.prefetchQuery(option as Prefetchable),
    ),
  );
  return <MockHydrationBoundary state={dehydrate(client)}>{children}</MockHydrationBoundary>;
}
