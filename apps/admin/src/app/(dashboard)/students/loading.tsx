import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="My Students">
      <TablePageSkeleton columns={4} label="Loading students" rows={6} />
    </AdminPageShell>
  );
}
