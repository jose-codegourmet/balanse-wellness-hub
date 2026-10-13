import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminPaymentsQueueInfiniteQuery } from "@/lib/query/queries";
import { getStaffSession } from "@/modules/session/current-staff";
import { PaymentReviewPage } from "./_components/payment-review-page/PaymentPages";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment review.",
};

export default async function Page() {
  const { actor } = await getStaffSession();
  return prefetchAdmin(
    [adminPaymentsQueueInfiniteQuery(actor, "gcash")],
    <AdminQuerySuspense>
      <PaymentReviewPage />
    </AdminQuerySuspense>,
  );
}
