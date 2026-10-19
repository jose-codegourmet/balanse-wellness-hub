import { hasPermission } from "@balanse/domain";
import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingsQuery, adminSessionsQuery, adminVenuesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { ScheduleListPage } from "./_components/schedule-list-page/ScheduleListPage";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Publish and manage sessions.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    hasPermission(actor, "bookings.read")
      ? [
          adminSessionsQuery(actor, serverFetcher(token)),
          adminVenuesQuery(actor, serverFetcher(token)),
          adminBookingsQuery(actor, undefined, serverFetcher(token)),
        ]
      : [adminSessionsQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <ScheduleListPage />
    </AdminQuerySuspense>,
  );
}
