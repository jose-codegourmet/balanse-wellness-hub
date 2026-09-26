import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import {
  adminClassesQuery,
  adminEventForSessionQuery,
  adminEventsQuery,
  adminSessionsQuery,
} from "@/lib/query/queries";
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
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [
      adminSessionsQuery(principal),
      adminClassesQuery(principal),
      adminEventsQuery(principal),
      adminEventForSessionQuery(principal, sessionId),
    ],
    <AdminQuerySuspense>
      <EventFormPage sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
