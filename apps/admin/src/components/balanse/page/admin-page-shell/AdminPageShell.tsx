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
    <section className={cn("grid min-w-0 gap-6 overflow-x-hidden", className)}>
      <header className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_66%)]"
        />
        <div className="relative p-5 sm:p-6 lg:p-7">
          <AdminBreadcrumb items={breadcrumb} />
          {eyebrow ? (
            <p className="mt-5 text-[0.6875rem] font-semibold tracking-[0.18em] text-primary uppercase">
              {eyebrow}
            </p>
          ) : null}
          <div className={cn("flex flex-wrap items-end justify-between gap-5", !eyebrow && "mt-5")}>
            <div className="min-w-0 max-w-3xl">
              <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        </div>
        {stats ? (
          <div className="relative border-t border-border/70 bg-muted/20 p-4 sm:p-5">{stats}</div>
        ) : null}
      </header>
      {tabs ? <div className="min-w-0">{tabs}</div> : null}
      {children ? <div className="min-w-0">{children}</div> : null}
    </section>
  );
}
