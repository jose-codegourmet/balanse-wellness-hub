import type { ApiFetcher } from "@balanse/api-client";
import { getPublicRoster, listPublicSessions } from "@balanse/api-client";
import { queryOptions } from "@tanstack/react-query";
import { webKeys } from "./keys";

/** Public session calendar/list (WIRE-0407, #361). Not customer-scoped. */
export const publicSessionsQuery = (range: { from: string; to: string }, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.publicSessions(range.from, range.to),
    queryFn: async () => (await listPublicSessions(fetcher, range)).items,
  });

/** Public roster — counts for a guest, display rows for a signed-in viewer (WIRE-0407, #361). */
export const publicRosterQuery = (id: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.publicRoster(id),
    queryFn: () => getPublicRoster(fetcher, id),
  });
