import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminStaffRoleQuery, adminStaffRolesQuery } from "@/lib/query/queries";
import { RoleFormPage } from "../_components/role-form-page/RoleFormPage";

export const metadata: Metadata = {
  title: "Role",
  description: "View or edit a staff role.",
};

export default async function Page({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminStaffRolesQuery(principal), adminStaffRoleQuery(principal, roleId)],
    <AdminQuerySuspense>
      <RoleFormPage roleId={roleId} />
    </AdminQuerySuspense>,
  );
}
