import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCustomersQuery, adminSessionRosterQuery } from "@/lib/query/queries";
import { RosterPage } from "@/modules/admin/RosterPage";

export const metadata: Metadata = {
  title: "Session roster",
  description: "Check-in and waitlist.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionRosterQuery(principal.role, sessionId), adminCustomersQuery(principal.role)],
    <RosterPage sessionId={sessionId} />,
  );
}
