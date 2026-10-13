import type { ApiFetcher } from "@balanse/api-client";
import { listVenues } from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Full venue list via `/api/admin/venues` (WIRE-0703, #360). */
export const adminVenuesQuery = (
  actor: StaffAuthorizationActor | null | undefined,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.venues.all(scope),
    queryFn: async () => (await listVenues(fetcher)).items,
  });
};
