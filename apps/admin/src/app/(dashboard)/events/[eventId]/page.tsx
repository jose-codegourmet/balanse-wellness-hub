import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminEventDetailQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { EventDetailPage } from "../_components/event-detail-page/EventDetailPage";

export const metadata: Metadata = {
  title: "Event",
  description: "Event content, linked session, and status history.",
};

export default async function EventDetailRoute({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminEventDetailQuery(actor, eventId, serverFetcher(token))],
    <AdminQuerySuspense>
      <EventDetailPage eventId={eventId} />
    </AdminQuerySuspense>,
  );
}
