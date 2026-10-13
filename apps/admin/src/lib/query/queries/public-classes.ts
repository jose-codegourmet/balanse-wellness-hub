import type { ApiFetcher } from "@balanse/api-client";
import { listPublicClasses } from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Active public classes. Used to name onboarding interests for staff without `classes.read`. */
export const adminPublicClassesQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.publicClasses(scope),
    queryFn: async () => (await listPublicClasses(fetcher)).items,
  });
};
