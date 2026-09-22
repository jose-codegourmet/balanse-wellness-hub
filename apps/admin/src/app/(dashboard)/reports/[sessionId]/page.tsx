import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionReportQuery } from "@/lib/query/queries";
import { ReportDrilldownPage } from "../_components/reports-page/ReportsPage";

export const metadata: Metadata = {
  title: "Session report",
  description: "Session performance drill-down.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionReportQuery(principal, sessionId)],
    <AdminQuerySuspense>
      <ReportDrilldownPage sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
