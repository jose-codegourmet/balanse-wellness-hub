import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionsQuery } from "@/lib/query/queries";
import { RecurringScheduleForm } from "../../_components/recurring-schedule-form/RecurringScheduleForm";

export const metadata: Metadata = {
  title: "Recurring schedule",
  description: "Create a weekly session series.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionsQuery(principal.role)],
    <AdminQuerySuspense>
      <RecurringScheduleForm sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
