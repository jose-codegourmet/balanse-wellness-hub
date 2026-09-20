import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCustomersQuery, adminPaymentsQuery } from "@/lib/query/queries";
import { PaymentReviewPage } from "@/modules/admin/PaymentPages";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment review.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminPaymentsQuery(principal.role), adminCustomersQuery(principal.role)],
    <AdminQuerySuspense>
      <PaymentReviewPage />
    </AdminQuerySuspense>,
  );
}
