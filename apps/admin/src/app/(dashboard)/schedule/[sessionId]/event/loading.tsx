import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Session event">
      <FormPageSkeleton label="Loading event form" sections={3} fields={8} />
    </AdminPageShell>
  );
}
