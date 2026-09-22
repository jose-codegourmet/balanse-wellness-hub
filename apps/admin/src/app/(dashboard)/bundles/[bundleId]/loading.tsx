import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Package">
      <FormPageSkeleton label="Loading package" sections={3} fields={6} />
    </AdminPageShell>
  );
}
