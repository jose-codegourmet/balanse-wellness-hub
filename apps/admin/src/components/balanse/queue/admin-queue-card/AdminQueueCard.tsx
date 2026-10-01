import { cn, StatusBadge } from "@balanse/ui";
import { ClockIcon } from "lucide-react";

import type { AdminQueueCardProps, AdminQueueFactsProps } from "./AdminQueueCard.meta";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminQueueCard({
  who,
  what,
  when,
  status,
  reference,
  body,
  media,
  actions,
  emphasis = false,
  className,
}: AdminQueueCardProps) {
  return (
    <article
      data-slot="admin-queue-card"
      data-emphasis={emphasis ? "needs-action" : undefined}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none",
        className,
      )}
    >
      {emphasis ? (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-primary/70" />
      ) : null}
      <header className="flex items-start gap-3 px-5 pt-5 pb-4 sm:gap-4">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-display text-sm text-foreground"
        >
          {initials(who)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <h2 className="min-w-0 font-display text-lg leading-tight wrap-break-word">{who}</h2>
            <StatusBadge status={status} surface="admin" />
          </div>
          {reference ? (
            <p className="mt-1 break-all font-mono text-xs font-medium tracking-wide text-foreground">
              Reference {reference}
            </p>
          ) : null}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="text-pretty">{what}</span>
            <time className="inline-flex items-center gap-1 text-xs">
              <ClockIcon className="size-3" aria-hidden />
              {when}
            </time>
          </p>
        </div>
      </header>
      {body || media ? (
        <div
          className={cn(
            "grid gap-4 border-t border-border/60 px-5 py-4",
            media && "md:grid-cols-[minmax(0,1fr)_11rem] md:items-start",
          )}
        >
          {body ? <div className="min-w-0 text-sm">{body}</div> : null}
          {media ? <div className="min-w-0 max-w-xs">{media}</div> : null}
        </div>
      ) : null}
      {actions ? (
        <footer className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/25 px-5 py-3">
          {actions}
        </footer>
      ) : null}
    </article>
  );
}

/** Label / value grid for the key facts inside an `AdminQueueCard` body. */
export function AdminQueueFacts({ items, className }: AdminQueueFactsProps) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-1.5 font-medium tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export type { AdminQueueCardProps, AdminQueueFactsProps };
