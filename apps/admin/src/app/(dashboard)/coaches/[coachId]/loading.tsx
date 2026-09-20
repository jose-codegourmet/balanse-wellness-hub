import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Edit Coach">
      <FormPageSkeleton label="Loading coach" sections={3} fields={4} />
    </AdminPageShell>
  );
}
