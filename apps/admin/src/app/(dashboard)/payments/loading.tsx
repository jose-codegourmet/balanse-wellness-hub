import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Payments">
      <TablePageSkeleton label="Loading payments" rows={8} columns={4} />
    </AdminPageShell>
  );
}
