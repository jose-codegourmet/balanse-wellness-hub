import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionsQuery, adminVenuesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { RecurringScheduleForm } from "../../_components/recurring-schedule-form/RecurringScheduleForm";

export const metadata: Metadata = {
  title: "Repeat weekly",
  description: "Create a weekly session series.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminSessionsQuery(actor, serverFetcher(token)),
      adminVenuesQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <RecurringScheduleForm sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
