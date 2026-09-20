import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Staff Detail">
      <FormPageSkeleton label="Loading staff" sections={1} fields={2} />
    </AdminPageShell>
  );
}
