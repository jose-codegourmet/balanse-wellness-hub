import { hasPermission } from "@balanse/domain";
import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCoachesQuery, adminStaffQuery, adminStaffRolesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { StaffDetailPage } from "../_components/staff-detail-page/StaffDetailPage";

export const metadata: Metadata = {
  title: "Staff detail",
  description: "Provision or edit staff.",
};

export default async function Page({ params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminStaffQuery(actor, serverFetcher(token)),
      adminStaffRolesQuery(actor, serverFetcher(token)),
      ...(actor && hasPermission(actor, "staff.manage")
        ? [adminCoachesQuery(actor, serverFetcher(token))]
        : []),
    ],
    <AdminQuerySuspense>
      <StaffDetailPage staffId={staffId} />
    </AdminQuerySuspense>,
  );
}
