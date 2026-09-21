import { CardListSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Cancellation Requests">
      <CardListSkeleton label="Loading cancellation requests" items={3} />
    </AdminPageShell>
  );
}
