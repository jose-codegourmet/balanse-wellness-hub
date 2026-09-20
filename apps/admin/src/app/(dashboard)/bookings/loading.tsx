import { ADMIN_BOOKING_TABS } from "@balanse/domain";
import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/AdminPageTabs";

export default function Loading() {
  return (
    <AdminPageShell
      title="Bookings"
      tabs={
        <AdminPageTabs tabs={ADMIN_BOOKING_TABS} value="pending" onValueChange={() => undefined} />
      }
    >
      <TablePageSkeleton label="Loading bookings" rows={8} columns={6} />
    </AdminPageShell>
  );
}
