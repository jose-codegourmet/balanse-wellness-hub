import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Transactions" eyebrow="Studio">
      <TablePageSkeleton label="Loading transactions" rows={8} columns={8} />
    </AdminPageShell>
  );
}
