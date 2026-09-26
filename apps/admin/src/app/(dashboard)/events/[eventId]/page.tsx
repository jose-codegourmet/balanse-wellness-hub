import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminEventDetailQuery } from "@/lib/query/queries";
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
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminEventDetailQuery(principal, eventId)],
    <AdminQuerySuspense>
      <EventDetailPage eventId={eventId} />
    </AdminQuerySuspense>,
  );
}
