import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import {
  adminPermissionsQuery,
  adminStaffRoleQuery,
  adminStaffRolesQuery,
} from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { RoleFormPage } from "../_components/role-form-page/RoleFormPage";

export const metadata: Metadata = {
  title: "Role",
  description: "View or edit a staff role.",
};

export default async function Page({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminStaffRolesQuery(actor, serverFetcher(token)),
      adminStaffRoleQuery(actor, roleId, serverFetcher(token)),
      adminPermissionsQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <RoleFormPage roleId={roleId} />
    </AdminQuerySuspense>,
  );
}
