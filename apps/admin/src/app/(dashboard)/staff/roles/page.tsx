import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminStaffRolesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { RoleListPage } from "./_components/role-list-page/RoleListPage";

export const metadata: Metadata = {
  title: "Roles",
  description: "Staff role catalogue.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminStaffRolesQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <RoleListPage />
    </AdminQuerySuspense>,
  );
}
