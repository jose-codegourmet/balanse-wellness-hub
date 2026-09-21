import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Classes">
      <TablePageSkeleton label="Loading classes" rows={6} columns={7} />
    </AdminPageShell>
  );
}
