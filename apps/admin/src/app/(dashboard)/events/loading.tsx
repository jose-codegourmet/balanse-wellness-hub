import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Events">
      <TablePageSkeleton label="Loading events" rows={5} columns={6} />
    </AdminPageShell>
  );
}
