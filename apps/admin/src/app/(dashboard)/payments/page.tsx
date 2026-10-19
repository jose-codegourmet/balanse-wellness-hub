import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminPaymentsQueueInfiniteQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { PaymentReviewPage } from "./_components/payment-review-page/PaymentPages";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment review.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminPaymentsQueueInfiniteQuery(actor, "gcash", "", serverFetcher(token))],
    <AdminQuerySuspense>
      <PaymentReviewPage />
    </AdminQuerySuspense>,
  );
}
