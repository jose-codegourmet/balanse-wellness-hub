import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminDashboardQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { DashboardPage } from "./_components/dashboard-page/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Operations overview.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin([adminDashboardQuery(actor, serverFetcher(token))], <DashboardPage />);
}
