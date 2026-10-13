import { type ApiFetcher, listCancellations } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

export const adminCancellationsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.cancellations.all(scope),
    queryFn: () => listCancellations(fetcher),
  });
};

export const adminCancellationsInfiniteQuery = (
  actor: StaffAuthorizationActor | null,
  search = "",
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return infiniteQueryOptions({
    queryKey: adminKeys.queues.cancellations(scope, search),
    queryFn: ({ pageParam }) => listCancellations(fetcher, { search, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
};
