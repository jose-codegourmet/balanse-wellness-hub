import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Add Class">
      <FormPageSkeleton label="Loading class" sections={3} fields={6} />
    </AdminPageShell>
  );
}
