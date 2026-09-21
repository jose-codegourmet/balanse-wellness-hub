import { cn } from "@/lib/utils";
import type { DashboardBentoProps } from "./DashboardBento.schema";

export function DashboardBento({ className, ...props }: DashboardBentoProps) {
  return (
    <div
      data-slot="dashboard-bento"
      className={cn(
        "grid grid-cols-1 gap-3 md:grid-cols-6 md:grid-flow-row-dense xl:grid-cols-12",
        className,
      )}
      {...props}
    />
  );
}
