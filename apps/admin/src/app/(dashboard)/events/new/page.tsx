import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminEventsQuery,
  adminSessionsQuery,
  adminVenuesQuery,
} from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { EventFormPage } from "../../schedule/_components/event-form-page/EventFormPage";

export const metadata: Metadata = {
  title: "New event",
  description: "Create an event for an existing session.",
};

export default async function NewEventRoute() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminSessionsQuery(actor, serverFetcher(token)),
      adminVenuesQuery(actor, serverFetcher(token)),
      adminCoachesQuery(actor, serverFetcher(token)),
      adminClassesQuery(actor, serverFetcher(token)),
      adminEventsQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <EventFormPage />
    </AdminQuerySuspense>,
  );
}
