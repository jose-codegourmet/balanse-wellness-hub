import Link from "next/link";
import { cn } from "@/lib/utils";
import { dashboardTileSpanClass } from "./DashboardTile.defaults";
import type { DashboardTileProps } from "./DashboardTile.schema";

export function DashboardTile({
  span = "stat",
  href,
  className,
  children,
  ...props
}: DashboardTileProps) {
  const spanClass = dashboardTileSpanClass[span];
  const frameClass = cn(
    "flex h-full min-h-0 flex-col rounded-xl border border-border bg-card p-4 md:p-5",
    href
      ? "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      : null,
    className,
  );

  if (href) {
    return (
      <article className={spanClass}>
        <Link href={href} className={frameClass}>
          {children}
        </Link>
      </article>
    );
  }

  return (
    <article className={cn(spanClass, frameClass)} {...props}>
      {children}
    </article>
  );
}
