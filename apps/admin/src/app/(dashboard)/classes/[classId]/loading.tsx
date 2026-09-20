import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Edit Class">
      <FormPageSkeleton label="Loading class" sections={2} fields={5} />
    </AdminPageShell>
  );
}
