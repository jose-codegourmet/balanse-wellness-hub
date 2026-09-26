import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery, adminEventsQuery, adminSessionsQuery } from "@/lib/query/queries";
import { EventFormPage } from "../../schedule/_components/event-form-page/EventFormPage";

export const metadata: Metadata = {
  title: "New event",
  description: "Create an event for an existing session.",
};

export default async function NewEventRoute() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionsQuery(principal), adminClassesQuery(principal), adminEventsQuery(principal)],
    <AdminQuerySuspense>
      <EventFormPage />
    </AdminQuerySuspense>,
  );
}
