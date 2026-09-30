import { DetailPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Student">
      <DetailPageSkeleton label="Loading student" />
    </AdminPageShell>
  );
}
