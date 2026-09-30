import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassChangeRequestsQuery, adminSessionsQuery } from "@/lib/query/queries";
import { ClassChangeRequestPage } from "../../_components/class-change-request-page/ClassChangeRequestPage";

export const metadata: Metadata = {
  title: "Request a class change",
  description: "Ask the studio to reschedule, substitute, or cancel a class you teach.",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { sessionId } = await params;
  const { kind } = await searchParams;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionsQuery(principal), adminClassChangeRequestsQuery(principal)],
    <AdminQuerySuspense>
      <ClassChangeRequestPage sessionId={sessionId} initialKind={kind?.toUpperCase()} />
    </AdminQuerySuspense>,
  );
}
