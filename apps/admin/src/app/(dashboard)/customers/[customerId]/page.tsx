import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBundlesQuery, adminCustomerDetailQuery } from "@/lib/query/queries";
import { CustomerDetailPage } from "../_components/customer-detail-page/CustomerDetailPage";

export const metadata: Metadata = {
  title: "Customer detail",
  description: "Customer record.",
};

export default async function Page({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminCustomerDetailQuery(principal.role, customerId), adminBundlesQuery(principal.role)],
    <AdminQuerySuspense>
      <CustomerDetailPage customerId={customerId} />
    </AdminQuerySuspense>,
  );
}
