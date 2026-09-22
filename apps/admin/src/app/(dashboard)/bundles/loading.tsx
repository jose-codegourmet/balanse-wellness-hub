import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Bundles">
      <TablePageSkeleton label="Loading packages" rows={5} columns={4} />
    </AdminPageShell>
  );
}
