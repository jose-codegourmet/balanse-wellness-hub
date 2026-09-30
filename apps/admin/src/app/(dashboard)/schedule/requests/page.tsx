import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassChangeRequestsQuery } from "@/lib/query/queries";
import { ClassChangeQueuePage } from "../_components/class-change-queue-page/ClassChangeQueuePage";

export const metadata: Metadata = {
  title: "Class change requests",
  description: "Approve or deny coach requests to reschedule, substitute, or cancel a class.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminClassChangeRequestsQuery(principal)],
    <AdminQuerySuspense>
      <ClassChangeQueuePage />
    </AdminQuerySuspense>,
  );
}
