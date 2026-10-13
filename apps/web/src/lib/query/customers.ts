import type { ApiFetcher } from "@balanse/api-client";
import { getMe, listMyPolicyAcceptances } from "@balanse/api-client";
import { queryOptions } from "@tanstack/react-query";
import { webKeys } from "./keys";

/** Signed-in customer profile and acceptance history (WIRE-1105). */
export const myProfileQuery = (customerId: string | null, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.me.profile(customerId),
    queryFn: () => getMe(fetcher),
  });

export const myPolicyAcceptancesQuery = (customerId: string | null, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.me.policyAcceptances(customerId),
    queryFn: () => listMyPolicyAcceptances(fetcher),
  });
