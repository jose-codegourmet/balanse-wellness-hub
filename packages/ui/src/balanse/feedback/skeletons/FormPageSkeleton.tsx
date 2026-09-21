import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import { countKeys } from "./count-keys";
import type { FormPageSkeletonProps } from "./FormPageSkeleton.schema";

function tabCount(tabs: FormPageSkeletonProps["tabs"]): number {
  if (tabs === true) return 4;
  if (typeof tabs === "number") return Math.max(tabs, 0);
  return 0;
}

export function FormPageSkeleton({
  label,
  sections = 2,
  fields = 3,
  tabs = false,
  className,
}: FormPageSkeletonProps) {
  const tabsToRender = tabCount(tabs);

  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("w-full", className)}>
      <div aria-hidden="true">
        <Skeleton className="h-9 w-40" />
        {tabsToRender > 0 ? (
          <div className="mt-6 hidden gap-4 border-b border-border md:flex">
            {countKeys("tab", tabsToRender).map((tabKey) => (
              <Skeleton key={tabKey} className="mb-px h-8 w-24" />
            ))}
          </div>
        ) : null}
        <div className="mt-8 grid gap-10 md:max-w-2xl">
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
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-2 max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-4 max-md:border-t max-md:border-border max-md:bg-background max-md:p-4 md:max-w-2xl">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
