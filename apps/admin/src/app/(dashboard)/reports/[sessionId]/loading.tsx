import { DetailPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Session report">
      <DetailPageSkeleton label="Loading session report" />
    </AdminPageShell>
  );
}
