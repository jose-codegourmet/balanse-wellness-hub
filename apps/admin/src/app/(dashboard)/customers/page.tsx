import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCustomersQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { CustomerListPage } from "./_components/customer-list-page/CustomerListPage";

export const metadata: Metadata = {
  title: "Customers",
  description: "Customer management.",
};

export default async function Page() {
  const { actor } = await getStaffSession();
  const fetcher = serverFetcher(await getStaffAccessToken());
  return prefetchAdmin(
    [adminCustomersQuery(actor, fetcher)],
    <AdminQuerySuspense>
      <CustomerListPage />
    </AdminQuerySuspense>,
  );
}
