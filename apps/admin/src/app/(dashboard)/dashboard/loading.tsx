import { BentoSkeleton } from "@balanse/ui";
import { dashboardSkeletonTilesForRole } from "@/components/balanse/dashboard/dashboard-bento/DashboardBento.stories-data";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { canPerformAdminAction } from "@/lib/authorization/admin-access";
import { getStaffSession } from "@/modules/session/current-staff";

export default async function Loading() {
  const { actor } = await getStaffSession();
  return (
    <AdminPageShell title="Dashboard">
      <BentoSkeleton
        label="Loading dashboard"
        tiles={dashboardSkeletonTilesForRole(canPerformAdminAction(actor, "dashboard-financial"))}
      />
    </AdminPageShell>
  );
}
