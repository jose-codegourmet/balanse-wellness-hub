import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingsQuery, adminSessionsQuery } from "@/lib/query/queries";
import { ScheduleListPage } from "@/modules/admin/schedule/ScheduleListPage";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Publish and manage sessions.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionsQuery(principal.role), adminBookingsQuery(principal.role)],
    <AdminQuerySuspense>
      <ScheduleListPage />
    </AdminQuerySuspense>,
  );
}
