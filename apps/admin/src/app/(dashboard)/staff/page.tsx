import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminStaffQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { StaffListPage } from "./_components/staff-list-page/StaffListPage";

export const metadata: Metadata = {
  title: "Staff",
  description: "Staff management.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminStaffQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <StaffListPage />
    </AdminQuerySuspense>,
  );
}
