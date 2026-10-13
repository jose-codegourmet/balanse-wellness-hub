import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCancellationsInfiniteQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { CancellationQueuePage } from "./_components/cancellation-queue-page/CancellationPages";

export const metadata: Metadata = {
  title: "Cancellations",
  description: "Cancellation requests.",
};

export default async function Page() {
  const [{ actor }, accessToken] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminCancellationsInfiniteQuery(actor, "", serverFetcher(accessToken))],
    <AdminQuerySuspense>
      <CancellationQueuePage />
    </AdminQuerySuspense>,
  );
}
