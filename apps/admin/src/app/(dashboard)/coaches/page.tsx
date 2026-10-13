import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCoachesQuery, adminSessionsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { CoachListPage } from "./_components/coach-list-page/CoachListPage";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Coach management.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminCoachesQuery(actor, serverFetcher(token)),
      adminSessionsQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <CoachListPage />
    </AdminQuerySuspense>,
  );
}
