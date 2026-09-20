import { dehydrate, HydrationBoundary, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { makeQueryClient } from "./client";

type Prefetchable = Parameters<QueryClient["prefetchQuery"]>[0];

/**
 * Server-only helper. Creates a fresh QueryClient per request — never cache a
 * client at module scope (cross-request bleed).
 *
 * Signature is stable for FE-ADM-018 (#208): `prefetchAdmin(options, children)`.
 * The parameter is intentionally wide so a route can pass mixed `queryOptions`.
 */
export async function prefetchAdmin(options: readonly object[], children: ReactNode) {
  const client = makeQueryClient();
  await Promise.all(options.map((option) => client.prefetchQuery(option as Prefetchable)));
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}
