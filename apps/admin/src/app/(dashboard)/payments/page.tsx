import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminPaymentsQueueInfiniteQuery } from "@/lib/query/queries";
import { PaymentReviewPage } from "./_components/payment-review-page/PaymentPages";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment review.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminPaymentsQueueInfiniteQuery(principal.role, "gcash")],
    <AdminQuerySuspense>
      <PaymentReviewPage />
    </AdminQuerySuspense>,
  );
}
