import { CardListSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Reschedule Requests">
      <CardListSkeleton label="Loading reschedule requests" items={3} />
    </AdminPageShell>
  );
}
