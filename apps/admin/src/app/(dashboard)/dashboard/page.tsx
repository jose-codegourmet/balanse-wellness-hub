import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminDashboardQuery } from "@/lib/query/queries";
import { DashboardPage } from "./_components/dashboard-page/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Operations overview.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin([adminDashboardQuery(principal.role)], <DashboardPage />);
}
