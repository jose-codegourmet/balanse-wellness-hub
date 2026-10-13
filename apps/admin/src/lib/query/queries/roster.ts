import type { ApiFetcher } from "@balanse/api-client";
import { getRoster } from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Session roster via `/api/admin/sessions/{id}/roster` (WIRE-0408, #361). */
export const adminSessionRosterQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher,
  sessionId: string,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.roster(scope, sessionId),
    queryFn: () => getRoster(fetcher, sessionId),
  });
};
