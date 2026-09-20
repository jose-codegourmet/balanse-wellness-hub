import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery, adminCoachesQuery, adminReportsQuery } from "@/lib/query/queries";
import { ReportsPage } from "@/modules/admin/ReportsPage";

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
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [
      adminClassesQuery(principal.role),
      adminCoachesQuery(principal.role),
      adminReportsQuery(principal.role, DEFAULT_REPORT_FILTERS),
    ],
    <AdminQuerySuspense>
      <ReportsPage />
    </AdminQuerySuspense>,
  );
}
