import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell
      title="Create role"
      breadcrumb={[
        { label: "Staff", href: "/staff" },
        { label: "Roles", href: "/staff/roles" },
        { label: "New" },
      ]}
    >
      <FormPageSkeleton label="Loading role" sections={2} fields={6} />
    </AdminPageShell>
  );
}
