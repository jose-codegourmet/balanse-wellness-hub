import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCustomersQuery } from "@/lib/query/queries";
import { CustomerListPage } from "@/modules/admin/customers/CustomerListPage";

export const metadata: Metadata = {
  title: "Customers",
  description: "Customer management.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminCustomersQuery(principal.role)],
    <AdminQuerySuspense>
      <CustomerListPage />
    </AdminQuerySuspense>,
  );
}
