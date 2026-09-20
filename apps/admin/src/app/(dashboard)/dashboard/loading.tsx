import { BentoSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Dashboard">
      <BentoSkeleton label="Loading dashboard" tiles={4} />
    </AdminPageShell>
  );
}
