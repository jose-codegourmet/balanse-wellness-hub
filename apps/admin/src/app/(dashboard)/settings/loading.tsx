import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Settings">
      <FormPageSkeleton label="Loading settings" sections={4} fields={3} />
    </AdminPageShell>
  );
}
