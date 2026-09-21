import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Staff Management">
      <TablePageSkeleton label="Loading staff" rows={6} columns={5} leadingCell="avatar" />
    </AdminPageShell>
  );
}
