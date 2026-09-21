import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Reports">
      <TablePageSkeleton label="Loading reports" rows={8} columns={6} />
    </AdminPageShell>
  );
}
