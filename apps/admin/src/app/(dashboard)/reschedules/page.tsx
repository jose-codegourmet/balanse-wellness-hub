import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingsQuery, adminReschedulesInfiniteQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { RescheduleQueuePage } from "./_components/reschedule-queue-page/ReschedulePages";

export const metadata: Metadata = {
  title: "Reschedules",
  description: "Reschedule requests.",
};

export default async function Page() {
  const [{ actor }, accessToken] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  const fetcher = serverFetcher(accessToken);
  return prefetchAdmin(
    [
      adminReschedulesInfiniteQuery(actor, "", fetcher),
      adminBookingsQuery(actor, undefined, fetcher),
    ],
    <AdminQuerySuspense>
      <RescheduleQueuePage />
    </AdminQuerySuspense>,
  );
}
