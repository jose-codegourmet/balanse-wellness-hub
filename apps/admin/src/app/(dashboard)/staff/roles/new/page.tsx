import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminStaffRolesQuery } from "@/lib/query/queries";
import { RoleFormPage } from "../_components/role-form-page/RoleFormPage";

export const metadata: Metadata = {
  title: "Create role",
  description: "Create a custom staff role.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminStaffRolesQuery(principal)],
    <AdminQuerySuspense>
      <RoleFormPage roleId="new" cloneSourceId={from} />
    </AdminQuerySuspense>,
  );
}
