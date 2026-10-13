import {
  type ApiFetcher,
  listAdminClassChangeRequests,
  listAdminSubstituteCoaches,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

export const adminClassChangeRequestsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.classChanges.all(scope),
    queryFn: async () => (await listAdminClassChangeRequests(fetcher)).items,
  });
};

export const adminSubstituteCoachOptionsQuery = (
  actor: StaffAuthorizationActor | null,
  sessionId: string,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.classChanges.substitutes(scope, sessionId),
    queryFn: async () => (await listAdminSubstituteCoaches(fetcher, sessionId)).items,
  });
};
