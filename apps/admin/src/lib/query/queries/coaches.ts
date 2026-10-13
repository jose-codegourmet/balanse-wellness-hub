import type { ApiFetcher } from "@balanse/api-client";
import { listAdminCoaches } from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Full coach roster via `/api/admin/coaches` (WIRE-0603, #359). */
export const adminCoachesQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.coaches.all(scope),
    queryFn: async () => (await listAdminCoaches(fetcher)).items,
  });
};
