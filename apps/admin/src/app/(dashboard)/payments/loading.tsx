import { CardListSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Payments">
      <CardListSkeleton label="Loading payments" items={3} />
    </AdminPageShell>
  );
}
