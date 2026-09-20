import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Customers">
      <TablePageSkeleton label="Loading customers" rows={8} columns={5} />
    </AdminPageShell>
  );
}
