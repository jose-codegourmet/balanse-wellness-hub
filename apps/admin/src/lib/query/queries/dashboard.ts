import { type ApiFetcher, getDashboard, getDashboardMetrics } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** `/dashboard` and `AdminSidebar` (WIRE-1802, #372). */
export const adminDashboardQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.dashboard(scope),
    queryFn: () => getDashboard(fetcher),
  });
};

export const adminDashboardMetricsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: [...adminKeys.dashboard(scope), "metrics"] as const,
    queryFn: () => getDashboardMetrics(fetcher),
  });
};
