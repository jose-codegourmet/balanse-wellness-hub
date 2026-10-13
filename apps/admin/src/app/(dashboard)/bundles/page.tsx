import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import {
  adminBundleAcquisitionsQuery,
  adminBundleMetricsQuery,
  adminBundlesQuery,
} from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { BundleListPage } from "./_components/bundle-list-page/BundleListPage";

export const metadata: Metadata = {
  title: "Bundles",
  description: "Session package catalogue.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  const fetcher = serverFetcher(token);
  return prefetchAdmin(
    [
      adminBundlesQuery(actor, fetcher),
      adminBundleAcquisitionsQuery(actor, fetcher),
      adminBundleMetricsQuery(actor, fetcher),
    ],
    <AdminQuerySuspense>
      <BundleListPage />
    </AdminQuerySuspense>,
  );
}
