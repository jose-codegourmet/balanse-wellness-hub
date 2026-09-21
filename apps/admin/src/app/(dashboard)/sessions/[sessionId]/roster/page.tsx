import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCustomersQuery, adminSessionRosterQuery } from "@/lib/query/queries";
import { RosterPage } from "./_components/roster-page/RosterPage";

export const metadata: Metadata = {
  title: "Session roster",
  description: "Check-in and waitlist.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionRosterQuery(principal.role, sessionId), adminCustomersQuery(principal.role)],
    <AdminQuerySuspense>
      <RosterPage sessionId={sessionId} />
    </AdminQuerySuspense>,
  );
}
