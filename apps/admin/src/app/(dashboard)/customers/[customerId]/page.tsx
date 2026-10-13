import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBundlesQuery, adminCustomerDetailQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { CustomerDetailPage } from "../_components/customer-detail-page/CustomerDetailPage";

export const metadata: Metadata = {
  title: "Customer detail",
  description: "Customer record.",
};

export default async function Page({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminCustomerDetailQuery(actor, serverFetcher(token), customerId),
      adminBundlesQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <CustomerDetailPage customerId={customerId} />
    </AdminQuerySuspense>,
  );
}
