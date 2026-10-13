import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionReportQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { ReportDrilldownPage } from "../_components/reports-page/ReportsPage";

export const metadata: Metadata = {
  title: "Session report",
  description: "Session performance drill-down.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminSessionReportQuery(actor, sessionId, serverFetcher(token))],
    <AdminQuerySuspense>
      <ReportDrilldownPage sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
