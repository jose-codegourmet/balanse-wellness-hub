import type { ApiFetcher } from "@balanse/api-client";
import { listAdminClasses } from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Full class catalogue via `/api/admin/classes` (WIRE-0504, #358). */
export const adminClassesQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.classes.all(scope),
    queryFn: async () => (await listAdminClasses(fetcher)).items,
  });
};
