import {
  type ApiFetcher,
  listAdminBundles,
  listAdminPackageAcquisitions,
} from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

export const adminBundlesQuery = (actor: StaffAuthorizationActor | null, fetcher: ApiFetcher) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.bundles.all(scope),
    queryFn: async () => (await listAdminBundles(fetcher)).items,
  });
};

export const adminBundleMetricsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.bundles.metrics(scope),
    queryFn: async () =>
      Object.fromEntries(
        (await listAdminBundles(fetcher)).items.map((bundle) => [bundle.id, bundle.metrics]),
      ),
  });
};

export const adminBundleAcquisitionsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.bundles.acquisitions(scope),
    queryFn: async () => (await listAdminPackageAcquisitions(fetcher)).items,
  });
};
