import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSettingsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
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
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminSettingsQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <SettingsPage />
    </AdminQuerySuspense>,
  );
}
