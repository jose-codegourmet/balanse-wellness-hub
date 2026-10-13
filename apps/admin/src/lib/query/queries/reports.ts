import {
  type ApiFetcher,
  getAdminReports,
  getMarketingInsights,
  getSalesOverview,
  getSessionReport,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { AdminReportFilters, StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Composes the four report calls behind one `AdminReports` (WIRE-1802, #372). */
export const adminReportsQuery = (
  actor: StaffAuthorizationActor | null,
  filters: AdminReportFilters,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.reports.list(scope, filters),
    queryFn: () => getAdminReports(fetcher, filters),
  });
};

export const adminReportsSalesQuery = (
  actor: StaffAuthorizationActor | null,
  range: { from: string; to: string },
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: [...adminKeys.reports.sales(scope), range] as const,
    queryFn: () => getSalesOverview(fetcher, range),
  });
};

export const adminSessionReportQuery = (
  actor: StaffAuthorizationActor | null,
  sessionId: string,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.reports.session(scope, sessionId),
    queryFn: () => getSessionReport(fetcher, sessionId),
  });
};

/** Manila calendar range (`YYYY-MM-DD`) → inclusive instant bounds for sign-up dates. */
export function marketingInsightsBounds(range: { from: string; to: string }) {
  return {
    from: `${range.from}T00:00:00.000+08:00`,
    to: `${range.to}T23:59:59.999+08:00`,
  };
}

/** WIRE-1902, #373 — counts only; gated on `reports.marketing.read` server-side. */
export const adminMarketingInsightsQuery = (
  actor: StaffAuthorizationActor | null,
  range: { from: string; to: string },
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.marketingInsights(scope, range),
    queryFn: () => getMarketingInsights(fetcher, marketingInsightsBounds(range)),
  });
};
