import { FormPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell
      title="Role"
      breadcrumb={[
        { label: "Staff", href: "/staff" },
        { label: "Roles", href: "/staff/roles" },
      ]}
    >
      <FormPageSkeleton label="Loading role" sections={2} fields={6} />
    </AdminPageShell>
  );
}
