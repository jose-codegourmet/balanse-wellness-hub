import { type ApiFetcher, listAdminTransactions } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { ADMIN_CURSOR_LIMIT_MAX, type StaffAuthorizationActor } from "@balanse/domain";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { type AdminTransactionsListFilters, adminKeys } from "../keys";

/**
 * Ledger pages for `/transactions` (#378). The server computes `totals` over
 * every record and repeats them on each page, so the summary ignores the tab
 * and the cursor. Pages are requested at the max size; the screen follows
 * `nextCursor` with "Load more".
 */
export const adminTransactionsInfiniteQuery = (
  actor: StaffAuthorizationActor | null,
  filters: AdminTransactionsListFilters = {},
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return infiniteQueryOptions({
    queryKey: adminKeys.transactions.list(scope, filters),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      listAdminTransactions(fetcher, {
        tab: filters.tab,
        cursor: pageParam,
        limit: ADMIN_CURSOR_LIMIT_MAX,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
};
