import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminPermissionsQuery, adminStaffRolesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { RoleFormPage } from "../_components/role-form-page/RoleFormPage";

export const metadata: Metadata = {
  title: "Create role",
  description: "Create a custom staff role.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminStaffRolesQuery(actor, serverFetcher(token)),
      adminPermissionsQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <RoleFormPage roleId="new" cloneSourceId={from} />
    </AdminQuerySuspense>,
  );
}
