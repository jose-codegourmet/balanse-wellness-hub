import { DetailPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Booking detail">
      <DetailPageSkeleton label="Loading booking" />
    </AdminPageShell>
  );
}
