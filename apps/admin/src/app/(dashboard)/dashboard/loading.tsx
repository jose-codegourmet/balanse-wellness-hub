import {
  MOCK_HARNESS_COOKIE,
  parseMockPrincipal,
  resolveMockStaffActor,
} from "@balanse/mock/session";
import { BentoSkeleton } from "@balanse/ui";
import { cookies } from "next/headers";
import { dashboardSkeletonTilesForRole } from "@/components/balanse/dashboard/dashboard-bento/DashboardBento.stories-data";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { canPerformAdminAction } from "@/lib/authorization/admin-access";

export default async function Loading() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  const actor = resolveMockStaffActor(principal);
  return (
    <AdminPageShell title="Dashboard">
      <BentoSkeleton
        label="Loading dashboard"
        tiles={dashboardSkeletonTilesForRole(canPerformAdminAction(actor, "dashboard-financial"))}
      />
    </AdminPageShell>
  );
}
