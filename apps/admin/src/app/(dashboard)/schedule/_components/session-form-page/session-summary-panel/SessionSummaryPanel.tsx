"use client";

import {
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  venueKindLabel,
} from "@balanse/domain";
import { Badge } from "@balanse/ui";
import { CalendarIcon, CoinsIcon, DumbbellIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { occurrenceWillBeSkipped } from "../../../_lib/session-occurrences";
import { conflictLabel, OccurrencePreview } from "../../occurrence-preview/OccurrencePreview";
import type { SessionSummaryPanelProps } from "./SessionSummaryPanel.meta";

export function SessionSummaryPanel({
  gymClassName,
  heroImage,
  sessionName,
  startsAt,
  endsAt,
  venue,
  coachNames,
  capacity,
  pricePhp,
  status,
  bookable,
  occurrences,
  rateLines,
  editing,
}: SessionSummaryPanelProps) {
  const timed = Number.isFinite(Date.parse(startsAt)) && Number.isFinite(Date.parse(endsAt));
  const repeating = occurrences.length > 1;
  const creating = occurrences.filter((row) => !occurrenceWillBeSkipped(row)).length;
  const skipped = occurrences.length - creating;
  const firstConflicts = occurrences[0]?.conflicts ?? [];

  return (
    <div className="grid gap-4">
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative aspect-[16/9] bg-muted">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-muted-foreground">
              <DumbbellIcon aria-hidden className="size-6" />
            </span>
          )}
          <Badge
            className="absolute top-3 left-3"
            variant={
              status === "PUBLISHED" ? "success" : status === "CANCELLED" ? "danger" : "warning"
            }
          >
            {status === "PUBLISHED"
              ? bookable
                ? "Published · bookable"
                : "Published · closed"
              : status === "CANCELLED"
                ? "Cancelled"
                : "Draft"}
          </Badge>
        </div>
        <div className="grid gap-3 p-4">
          <div className="grid gap-0.5">
            <p className="text-[0.625rem] font-semibold tracking-[0.18em] text-primary uppercase">
              {gymClassName || "Class"}
            </p>
            <h3 className="font-display text-xl leading-tight">
              {sessionName || gymClassName || "New session"}
            </h3>
          </div>
          <ul className="grid gap-1.5 text-sm">
            <Fact icon={CalendarIcon}>
              {timed ? (
                <>
                  {formatSessionDate(startsAt)}
                  <br />
                  <span className="text-muted-foreground">
                    {formatSessionTimeRange(startsAt, endsAt)}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">Pick a date and time</span>
              )}
            </Fact>
            <Fact icon={MapPinIcon}>
              {venue ? (
                <span className="flex flex-wrap items-center gap-1.5">
                  {venue.name}
                  {venue.kind === "OFFSITE" ? (
                    <Badge variant="accent" size="sm">
                      {venueKindLabel(venue.kind)}
                    </Badge>
                  ) : null}
                </span>
              ) : (
                <span className="text-muted-foreground">Pick a venue</span>
              )}
            </Fact>
            <Fact icon={UsersIcon}>
              {coachNames.length > 0 ? (
                coachNames.join(", ")
              ) : (
                <span className="text-muted-foreground">No coach yet</span>
              )}
            </Fact>
            <Fact icon={CoinsIcon}>
              {formatPeso(pricePhp)} · {capacity} {capacity === 1 ? "spot" : "spots"}
            </Fact>
          </ul>
          {!repeating && firstConflicts.length > 0 ? (
            <ul className="grid gap-1.5 border-t border-border pt-3">
              {firstConflicts.map((conflict) => (
                <li
                  key={`${conflict.kind}-${conflict.session.id}`}
                  className="rounded-lg bg-muted/50 px-3 py-2 text-xs"
                >
                  {conflictLabel(conflict)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>

      {repeating ? (
        <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold">
              {editing
                ? "Series"
                : `Creates ${creating} ${creating === 1 ? "session" : "sessions"}`}
            </h3>
            {skipped > 0 ? (
              <span className="text-xs text-muted-foreground">{skipped} already scheduled</span>
            ) : null}
          </div>
          <OccurrencePreview occurrences={occurrences} />
        </section>
      ) : null}

      {rateLines && rateLines.length > 0 ? (
        <section className="grid gap-2 rounded-2xl border border-dashed border-border p-4">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Coach rate snapshot
          </h3>
          <ul className={cn("grid gap-1 text-sm")}>
            {rateLines.map((line) => (
              <li key={line.coachName} className="flex justify-between gap-3">
                <span>{line.coachName}</span>
                <span className="text-right">
                  {line.label}
                  <span className="block text-xs text-muted-foreground">{line.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Fact({ icon: Icon, children }: { icon: typeof CalendarIcon; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}
