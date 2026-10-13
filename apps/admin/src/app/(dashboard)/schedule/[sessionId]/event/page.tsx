import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminEventForSessionQuery,
  adminEventsQuery,
  adminSessionsQuery,
  adminVenuesQuery,
} from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { EventFormPage } from "../../_components/event-form-page/EventFormPage";

export const metadata: Metadata = {
  title: "Session event",
  description: "Create or edit the event for this session.",
};

export default async function SessionEventRoute({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminSessionsQuery(actor, serverFetcher(token)),
      adminVenuesQuery(actor, serverFetcher(token)),
      adminCoachesQuery(actor, serverFetcher(token)),
      adminClassesQuery(actor, serverFetcher(token)),
      adminEventsQuery(actor, serverFetcher(token)),
      adminEventForSessionQuery(actor, sessionId, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <EventFormPage sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
