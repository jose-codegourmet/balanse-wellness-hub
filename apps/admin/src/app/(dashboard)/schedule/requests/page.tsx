import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassChangeRequestsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { ClassChangeQueuePage } from "../_components/class-change-queue-page/ClassChangeQueuePage";

export const metadata: Metadata = {
  title: "Class change requests",
  description: "Approve or deny coach requests to reschedule, substitute, or cancel a class.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminClassChangeRequestsQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <ClassChangeQueuePage />
    </AdminQuerySuspense>,
  );
}
