import { TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell
      title="Roles"
      breadcrumb={[{ label: "Staff", href: "/staff" }, { label: "Roles" }]}
    >
      <TablePageSkeleton label="Loading roles" rows={4} columns={6} />
    </AdminPageShell>
  );
}
