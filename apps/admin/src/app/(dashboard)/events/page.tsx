import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminEventsQuery } from "@/lib/query/queries";
import { EventListPage } from "./_components/event-list-page/EventListPage";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming-first index of events tied to a scheduled session.",
};

export default async function EventsIndexRoute() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminEventsQuery(principal)],
    <AdminQuerySuspense>
      <EventListPage />
    </AdminQuerySuspense>,
  );
}
