import { hasPermission } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import {
  MOCK_HARNESS_COOKIE,
  parseMockPrincipal,
  resolveMockStaffActor,
} from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { firstImplementedPermittedAdminRoute } from "@/lib/authorization/admin-access";
import { bindAdminQueryPrincipal } from "@/lib/query/auth-scope";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionRosterQuery } from "@/lib/query/queries";
import { RosterPage } from "./_components/roster-page/RosterPage";

export const metadata: Metadata = {
  title: "Session roster",
  description: "Check-in and waitlist.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  const actor = resolveMockStaffActor(principal);
  bindAdminQueryPrincipal(principal);
  const mayReadAll = hasPermission(actor, "roster.read.all");
  const mayReadOwn = hasPermission(actor, "roster.read.own");
  if (!mayReadAll && !mayReadOwn) {
    return <AccessDenied kind="denied" homeHref={firstImplementedPermittedAdminRoute(actor)} />;
  }
  if (!mayReadAll) {
    const assigned = (await getMockAdapter().getAdminSessions()).some(
      (row) => row.id === sessionId,
    );
    if (!assigned) {
      return <AccessDenied kind="ownership" homeHref="/schedule" />;
    }
  }
  return prefetchAdmin(
    [adminSessionRosterQuery(principal, sessionId)],
    <AdminQuerySuspense>
      <RosterPage sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
