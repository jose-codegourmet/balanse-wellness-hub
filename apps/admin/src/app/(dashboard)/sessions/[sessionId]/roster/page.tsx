import { listAdminSessions } from "@balanse/api-client";
import { hasPermission } from "@balanse/domain";
import type { Metadata } from "next";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { firstImplementedPermittedAdminRoute } from "@/lib/authorization/admin-access";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionRosterQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { RosterPage } from "./_components/roster-page/RosterPage";

export const metadata: Metadata = {
  title: "Session roster",
  description: "Check-in and waitlist.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  const fetcher = serverFetcher(token);
  const mayReadAll = hasPermission(actor, "roster.read.all");
  const mayReadOwn = hasPermission(actor, "roster.read.own");
  if (!mayReadAll && !mayReadOwn) {
    return <AccessDenied kind="denied" homeHref={firstImplementedPermittedAdminRoute(actor)} />;
  }
  if (!mayReadAll) {
    // Scope the ownership check to this actor's own coach (WIRE-0411, #361) —
    // the server also enforces this on the roster read itself, but checking
    // here first avoids a round trip that just comes back 403.
    const { items } = await listAdminSessions(fetcher, { coachId: actor?.coachId ?? undefined });
    if (!items.some((row) => row.id === sessionId)) {
      return <AccessDenied kind="ownership" homeHref="/schedule" />;
    }
  }
  return prefetchAdmin(
    [adminSessionRosterQuery(actor, fetcher, sessionId)],
    <AdminQuerySuspense>
      <RosterPage sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
