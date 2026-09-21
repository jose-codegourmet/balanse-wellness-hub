import { Skeleton } from "@balanse/ui";
export default function Loading() {
  return (
    <div className="marketing-container space-y-8 py-16" role="status" aria-label="Loading classes">
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <span className="sr-only">Loading classes</span>
    </div>
  );
}
