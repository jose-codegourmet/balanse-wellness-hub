import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery, adminCoachesQuery, adminReportsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { ReportsPage } from "./_components/reports-page/ReportsPage";

export const metadata: Metadata = {
  title: "Reports",
  description: "Sales and inventory reports.",
};

const DEFAULT_REPORT_FILTERS = {
  from: "2026-09-01",
  to: "2026-09-30",
  classId: "all",
  coachId: "all",
  sessionStatus: "all" as const,
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminClassesQuery(actor, serverFetcher(token)),
      adminCoachesQuery(actor, serverFetcher(token)),
      adminReportsQuery(actor, DEFAULT_REPORT_FILTERS, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <ReportsPage />
    </AdminQuerySuspense>,
  );
}
