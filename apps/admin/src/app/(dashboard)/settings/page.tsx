import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSettingsQuery } from "@/lib/query/queries";
import { SettingsPage } from "./_components/settings-page/SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
  description: "Studio settings.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  // GCash payment details moved from the Settings "Payment info" tab to Payment QR.
  if ((await searchParams).tab === "payment") redirect("/payment-qr");
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSettingsQuery(principal)],
    <AdminQuerySuspense>
      <SettingsPage />
    </AdminQuerySuspense>,
  );
}
