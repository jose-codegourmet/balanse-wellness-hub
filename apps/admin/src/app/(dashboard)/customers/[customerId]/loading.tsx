import { DetailPageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Customer">
      <DetailPageSkeleton label="Loading customer" />
    </AdminPageShell>
  );
}
