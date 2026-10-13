import { type ApiFetcher, listReschedules } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

export const adminReschedulesQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.reschedules.all(scope),
    queryFn: () => listReschedules(fetcher),
  });
};

export const adminReschedulesInfiniteQuery = (
  actor: StaffAuthorizationActor | null,
  search = "",
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return infiniteQueryOptions({
    queryKey: adminKeys.queues.reschedules(scope, search),
    queryFn: ({ pageParam }) => listReschedules(fetcher, { search, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
};
