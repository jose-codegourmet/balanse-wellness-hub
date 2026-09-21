import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCancellationsInfiniteQuery } from "@/lib/query/queries";
import { CancellationQueuePage } from "@/modules/admin/CancellationPages";

export const metadata: Metadata = {
  title: "Cancellations",
  description: "Cancellation requests.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminCancellationsInfiniteQuery(principal.role)],
    <AdminQuerySuspense>
      <CancellationQueuePage />
    </AdminQuerySuspense>,
  );
}
