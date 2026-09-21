import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCoachesQuery, adminStaffQuery } from "@/lib/query/queries";
import { StaffListPage } from "@/modules/admin/staff/StaffListPage";

export const metadata: Metadata = {
  title: "Staff",
  description: "Staff management.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminStaffQuery(principal.role), adminCoachesQuery(principal.role)],
    <AdminQuerySuspense>
      <StaffListPage />
    </AdminQuerySuspense>,
  );
}
