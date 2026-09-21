import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminPaymentQrsQuery, adminSettingsQuery } from "@/lib/query/queries";
import { PaymentQrPage } from "./_components/payment-qr-page/PaymentQrPage";

export const metadata: Metadata = {
  title: "Payment QR",
  description: "QRs used to receive payment.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSettingsQuery(principal.role), adminPaymentQrsQuery(principal.role)],
    <AdminQuerySuspense>
      <PaymentQrPage />
    </AdminQuerySuspense>,
  );
}
