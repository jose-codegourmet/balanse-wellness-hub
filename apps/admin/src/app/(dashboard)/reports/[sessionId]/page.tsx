import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionReportQuery } from "@/lib/query/queries";
import { ReportDrilldownPage } from "@/modules/admin/ReportsPage";

export const metadata: Metadata = {
  title: "Session report",
  description: "Session performance drill-down.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionReportQuery(principal.role, sessionId)],
    <ReportDrilldownPage sessionId={sessionId} />,
  );
}
