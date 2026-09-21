import { Skeleton, TablePageSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

const STAT_KEYS = ["total", "upcoming", "recent", "never"] as const;

export default function Loading() {
  return (
    <AdminPageShell
      title="Customers"
      stats={
        <div
          role="status"
          aria-busy="true"
          aria-label="Loading customer stats"
          className="grid grid-cols-2 gap-3 xl:grid-cols-4"
        >
          {STAT_KEYS.map((key) => (
            <div
              key={key}
              className="flex min-h-[7.5rem] flex-col rounded-xl border border-border bg-card p-4 md:p-5"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-6 h-8 w-16" />
            </div>
          ))}
        </div>
      }
    >
      <TablePageSkeleton label="Loading customers" rows={8} columns={6} />
    </AdminPageShell>
  );
}
