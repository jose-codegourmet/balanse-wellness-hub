import type { ApiFetcher } from "@balanse/api-client";
import { listPublicClasses } from "@balanse/api-client";
import { queryOptions } from "@tanstack/react-query";
import { webKeys } from "./keys";

/**
 * Public class catalogue (WIRE-0504, #358): `ClassesPage`, `ClassDetailPage`,
 * calendar filters, onboarding interests. Not customer-scoped — same data
 * for every viewer, including guests.
 */
export const publicClassesQuery = (fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.publicClasses(),
    queryFn: async () => (await listPublicClasses(fetcher)).items,
  });
