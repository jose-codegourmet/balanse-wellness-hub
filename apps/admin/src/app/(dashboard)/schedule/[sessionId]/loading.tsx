import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Edit Session">
      <FormPageSkeleton label="Loading session" sections={3} fields={3} />
    </AdminPageShell>
  );
}
