import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="My profile">
      <FormPageSkeleton fields={3} label="Loading your profile" sections={2} />
    </AdminPageShell>
  );
}
