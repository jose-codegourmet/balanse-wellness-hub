import type { ApiFetcher } from "@balanse/api-client";
import { listPublicCoaches } from "@balanse/api-client";
import { queryOptions } from "@tanstack/react-query";
import { webKeys } from "./keys";

/** Public coach roster (WIRE-0603, #359). Not customer-scoped. */
export const publicCoachesQuery = (fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.publicCoaches(),
    queryFn: async () => (await listPublicCoaches(fetcher)).items,
  });
