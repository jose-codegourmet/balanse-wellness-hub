import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell
      title="Venue"
      breadcrumb={[{ label: "Venues", href: "/venues" }, { label: "Venue" }]}
    >
      <FormPageSkeleton label="Loading venue" sections={2} fields={7} />
    </AdminPageShell>
  );
}
