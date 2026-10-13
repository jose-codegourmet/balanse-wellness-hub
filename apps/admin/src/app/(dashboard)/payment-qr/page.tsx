import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminPaymentQrsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { PaymentQrPage } from "./_components/payment-qr-page/PaymentQrPage";

export const metadata: Metadata = {
  title: "Payment accounts",
  description: "GCash, Maya, and QR Ph accounts customers pay into.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminPaymentQrsQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <PaymentQrPage />
    </AdminQuerySuspense>,
  );
}
