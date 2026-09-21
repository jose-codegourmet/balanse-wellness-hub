import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Bookings">
      <TablePageSkeleton label="Loading bookings" rows={8} columns={6} />
    </AdminPageShell>
  );
}
