import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Coaches">
      <TablePageSkeleton label="Loading coaches" rows={6} columns={3} />
    </AdminPageShell>
  );
}
