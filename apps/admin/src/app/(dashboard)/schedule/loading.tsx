import { CalendarSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Schedule">
      <CalendarSkeleton label="Loading schedule" />
    </AdminPageShell>
  );
}
