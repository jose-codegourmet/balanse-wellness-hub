import { DetailPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell
      title="Roster"
      breadcrumb={[{ label: "Schedule", href: "/schedule" }, { label: "Roster" }]}
    >
      <DetailPageSkeleton label="Loading roster" />
    </AdminPageShell>
  );
}
