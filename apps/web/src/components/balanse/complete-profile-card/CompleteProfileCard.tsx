import { Button } from "@balanse/ui";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CompleteProfileCardProps } from "./CompleteProfileCard.meta";

const MAX_LISTED = 3;

export function CompleteProfileCard({
  completion,
  status,
  href = "/portal/welcome?returnTo=/portal",
  className,
}: CompleteProfileCardProps) {
  const { completedCount, total, missing } = completion;
  const listed = missing.slice(0, MAX_LISTED);
  const percent = Math.round((completedCount / total) * 100);

  return (
    <section
      aria-labelledby="complete-profile-title"
      data-status={status}
      className={cn(
        "grid gap-3 rounded-xl border border-border bg-card px-4 py-4 sm:px-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <h2 id="complete-profile-title" className="text-sm font-semibold">
              Complete your profile
            </h2>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {total} done
              {status === "skipped" ? " · pick up where you left off" : ""}
            </p>
          </div>
        </div>
        <Button size="sm" nativeButton={false} render={<Link href={href} />}>
          Continue <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Profile completion"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completedCount}
        aria-valuetext={`${completedCount} of ${total} done`}
      >
        <span className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
      {listed.length > 0 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {listed.map((item) => (
            <li key={item.step} className="before:mr-1.5 before:content-['·']">
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
