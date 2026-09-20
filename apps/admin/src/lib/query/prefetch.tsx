import { dehydrate, type FetchQueryOptions, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { makeQueryClient } from "./client";

/**
 * Server-only helper. Creates a fresh QueryClient per request — never cache a
 * client at module scope (cross-request bleed).
 *
 * Signature is stable for FE-ADM-018 (#208): `prefetchAdmin(options, children)`.
 */
export async function prefetchAdmin(
  options: FetchQueryOptions[],
  children: ReactNode,
) {
  const client = makeQueryClient();
  await Promise.all(options.map((option) => client.prefetchQuery(option)));
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}
