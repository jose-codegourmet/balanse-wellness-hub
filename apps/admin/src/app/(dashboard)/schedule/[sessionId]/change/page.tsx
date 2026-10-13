import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassChangeRequestsQuery, adminSessionsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { ClassChangeRequestPage } from "../../_components/class-change-request-page/ClassChangeRequestPage";

export const metadata: Metadata = {
  title: "Request a class change",
  description: "Ask the studio to reschedule, substitute, or cancel a class you teach.",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { sessionId } = await params;
  const { kind } = await searchParams;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminSessionsQuery(actor, serverFetcher(token)),
      adminClassChangeRequestsQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <ClassChangeRequestPage sessionId={sessionId} initialKind={kind?.toUpperCase()} />
    </AdminQuerySuspense>,
  );
}
