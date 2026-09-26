import { DetailPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell
      title="Event"
      breadcrumb={[{ label: "Events", href: "/events" }, { label: "Event" }]}
    >
      <DetailPageSkeleton label="Loading event" />
    </AdminPageShell>
  );
}
