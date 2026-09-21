import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Edit Coach">
      <FormPageSkeleton label="Loading coach" sections={3} fields={4} tabs={4} />
    </AdminPageShell>
  );
}
