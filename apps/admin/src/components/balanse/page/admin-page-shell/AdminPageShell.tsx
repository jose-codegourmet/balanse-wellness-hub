import { cn } from "@/lib/utils";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import type { AdminPageShellProps } from "./AdminPageShell.meta";

export function AdminPageShell({
  title,
  description,
  eyebrow,
  breadcrumb,
  actions,
  tabs,
  stats,
  children,
  className,
}: AdminPageShellProps) {
  return (
    <section className={cn("grid min-w-0 gap-4 overflow-x-hidden", className)}>
      <AdminBreadcrumb items={breadcrumb} />
      {eyebrow ? <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-display text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {stats ? <div>{stats}</div> : null}
      {tabs ? <div className="min-w-0">{tabs}</div> : null}
      {children ? <div className="min-w-0">{children}</div> : null}
    </section>
  );
}
