import type { AdminTransactionsPage, AdminTransactionsQuery } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

/**
 * Transactions ledger page (#378): booking payments, refunds, and paid package
 * purchases with server-computed totals. `totals` are identical on every page
 * and ignore `tab` and `search`, so the summary never changes while paging.
 */
export function listAdminTransactions(
  fetcher: ApiFetcher,
  input: AdminTransactionsQuery = {},
): Promise<AdminTransactionsPage> {
  const params = new URLSearchParams();
  if (input.tab && input.tab !== "all") params.set("tab", input.tab);
  if (input.search?.trim()) params.set("q", input.search.trim());
  if (input.cursor) params.set("cursor", input.cursor);
  if (input.limit) params.set("limit", String(input.limit));
  const suffix = params.size ? `?${params}` : "";
  return fetcher<AdminTransactionsPage>(`/api/admin/transactions${suffix}`);
}
