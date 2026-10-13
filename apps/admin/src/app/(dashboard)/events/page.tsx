import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminEventsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { EventListPage } from "./_components/event-list-page/EventListPage";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming-first index of events tied to a scheduled session.",
};

export default async function EventsIndexRoute() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminEventsQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <EventListPage />
    </AdminQuerySuspense>,
  );
}
