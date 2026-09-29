import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Venues">
      <TablePageSkeleton label="Loading venues" rows={4} columns={5} />
    </AdminPageShell>
  );
}
