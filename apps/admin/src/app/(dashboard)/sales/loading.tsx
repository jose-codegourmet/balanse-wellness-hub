import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Sales" eyebrow="Studio">
      <TablePageSkeleton label="Loading sales" rows={8} columns={4} />
    </AdminPageShell>
  );
}
