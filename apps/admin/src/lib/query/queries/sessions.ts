import type { ApiFetcher } from "@balanse/api-client";
import { listAdminSessions } from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Full session list via `/api/admin/sessions` (WIRE-0408, #361). Screens filter client-side. */
export const adminSessionsQuery = (actor: StaffAuthorizationActor | null, fetcher: ApiFetcher) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.sessions.all(scope),
    queryFn: async () => (await listAdminSessions(fetcher)).items,
  });
};
