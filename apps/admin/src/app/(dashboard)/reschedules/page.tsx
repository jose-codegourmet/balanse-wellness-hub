import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingsQuery, adminReschedulesInfiniteQuery } from "@/lib/query/queries";
import { RescheduleQueuePage } from "@/modules/admin/ReschedulePages";

export const metadata: Metadata = {
  title: "Reschedules",
  description: "Reschedule requests.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminReschedulesInfiniteQuery(principal.role), adminBookingsQuery(principal.role)],
    <AdminQuerySuspense>
      <RescheduleQueuePage />
    </AdminQuerySuspense>,
  );
}
