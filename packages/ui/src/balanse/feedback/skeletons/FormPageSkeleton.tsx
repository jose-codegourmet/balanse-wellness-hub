import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import { countKeys } from "./count-keys";
import type { FormPageSkeletonProps } from "./FormPageSkeleton.schema";

export function FormPageSkeleton({
  label,
  sections = 2,
  fields = 3,
  className,
}: FormPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn("w-full max-w-2xl", className)}
    >
      <div aria-hidden="true">
        <Skeleton className="h-9 w-40" />
        <div className="mt-8 grid gap-10">
          {countKeys("section", sections).map((sectionKey) => (
            <section key={sectionKey}>
              <Skeleton className="h-8 w-56" />
              <div className="mt-4 grid gap-4">
                {countKeys("field", fields).map((fieldKey) => (
                  <div key={fieldKey} className="grid gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </section>
          ))}
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
