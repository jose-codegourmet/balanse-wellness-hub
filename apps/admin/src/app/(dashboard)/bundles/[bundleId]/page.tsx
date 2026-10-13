import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBundleMetricsQuery, adminBundlesQuery, adminClassesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { BundleFormPage } from "../_components/bundle-form-page/BundleFormPage";

export const metadata: Metadata = {
  title: "Package",
  description: "Create or edit a session package.",
};

export default async function Page({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminBundlesQuery(actor, serverFetcher(token)),
      adminClassesQuery(actor, serverFetcher(token)),
      adminBundleMetricsQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <BundleFormPage bundleId={bundleId} />
    </AdminQuerySuspense>,
  );
}
