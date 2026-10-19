import { type ApiFetcher, getPaymentProofSignedUrl, listAdminPayments } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { AdminPaymentTab, StaffAuthorizationActor } from "@balanse/domain";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

export const adminPaymentsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.payments.all(scope),
    queryFn: async () => (await listAdminPayments(fetcher, { tab: "gcash" })).items,
  });
};

export const adminPaymentProofUrlQuery = (
  actor: StaffAuthorizationActor | null,
  paymentId: string,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.proofUrl(scope, paymentId),
    queryFn: () => getPaymentProofSignedUrl(fetcher, paymentId),
  });
};

export const adminPaymentsQueueInfiniteQuery = (
  actor: StaffAuthorizationActor | null,
  tab: AdminPaymentTab,
  search = "",
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return infiniteQueryOptions({
    queryKey: adminKeys.queues.payments(scope, tab, search),
    queryFn: ({ pageParam }) => listAdminPayments(fetcher, { tab, search, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
};
