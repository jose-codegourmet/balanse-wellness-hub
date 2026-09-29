"use client";

import { formatSessionTime, sessionDisplayName } from "@balanse/domain";
import { CopyXIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type OccurrenceConflict,
  occurrenceWillBeSkipped,
  type PlannedOccurrence,
} from "../../_lib/session-occurrences";
import type { OccurrencePreviewProps } from "./OccurrencePreview.meta";

const WEEK_HEADER = ["M", "T", "W", "T", "F", "S", "S"];

export function OccurrencePreview({
  occurrences,
  maxMonths = 3,
  maxConflicts = 4,
  className,
}: OccurrencePreviewProps) {
  const byYmd = new Map(occurrences.map((row) => [row.ymd, row]));
  const months = [...new Set(occurrences.map((row) => row.ymd.slice(0, 7)))].sort();
  const shown = months.slice(0, maxMonths);
  const hiddenMonths = months.length - shown.length;
  const clashes = occurrences.flatMap((row) =>
    row.conflicts
      .filter((conflict) => !(conflict.kind === "duplicate" && !row.isFirst))
      .map((conflict) => ({ row, conflict })),
  );

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {shown.map((month) => (
          <MonthGrid key={month} month={month} byYmd={byYmd} />
        ))}
      </div>
      {hiddenMonths > 0 ? (
        <p className="text-xs text-muted-foreground">
          +{hiddenMonths} more {hiddenMonths === 1 ? "month" : "months"} in this series
        </p>
      ) : null}
      <Legend />
      {clashes.length > 0 ? (
        <ul className="grid gap-1.5">
          {clashes.slice(0, maxConflicts).map(({ row, conflict }) => (
            <li
              key={`${row.ymd}-${conflict.kind}-${conflict.session.id}`}
              className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs"
            >
              <ConflictIcon conflict={conflict} />
              <span>
                <span className="font-medium">{shortDate(row.ymd)}</span> ·{" "}
                {conflictLabel(conflict)}
              </span>
            </li>
          ))}
          {clashes.length > maxConflicts ? (
            <li className="px-3 text-xs text-muted-foreground">
              +{clashes.length - maxConflicts} more to check
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

function MonthGrid({
  month,
  byYmd,
}: {
  month: string;
  byYmd: ReadonlyMap<string, PlannedOccurrence>;
}) {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(first);

  return (
    <section aria-label={label} className="grid gap-2">
      <h4 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </h4>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.6875rem]">
        {WEEK_HEADER.map((day, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed weekday header
          <span key={index} aria-hidden className="text-muted-foreground">
            {day}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            // biome-ignore lint/suspicious/noArrayIndexKey: leading blanks
            return <span key={`blank-${index}`} aria-hidden />;
          }
          const ymd = `${month}-${String(day).padStart(2, "0")}`;
          const row = byYmd.get(ymd);
          return <DayCell key={ymd} day={day} row={row} />;
        })}
      </div>
    </section>
  );
}

function DayCell({ day, row }: { day: number; row?: PlannedOccurrence }) {
  if (!row) {
    return (
      <span className="grid aspect-square place-items-center text-muted-foreground/60">{day}</span>
    );
  }
  const skipped = occurrenceWillBeSkipped(row);
  const flagged = !skipped && row.conflicts.length > 0;
  return (
    <span
      title={describe(row, skipped)}
      className={cn(
        "grid aspect-square place-items-center rounded-full font-semibold tabular-nums",
        row.isFirst && "bg-primary text-primary-foreground",
        !row.isFirst && !skipped && "bg-primary/15 text-foreground",
        skipped && "text-muted-foreground line-through",
        flagged && "ring-2 ring-(--balanse-gold-deep)",
      )}
    >
      {day}
    </span>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[0.6875rem] text-muted-foreground">
      <li className="flex items-center gap-1">
        <span aria-hidden className="size-2.5 rounded-full bg-primary" /> First session
      </li>
      <li className="flex items-center gap-1">
        <span aria-hidden className="size-2.5 rounded-full bg-primary/25" /> Repeats
      </li>
      <li className="flex items-center gap-1">
        <span aria-hidden className="size-2.5 rounded-full ring-2 ring-(--balanse-gold-deep)" />{" "}
        Check clash
      </li>
      <li className="flex items-center gap-1">
        <span aria-hidden className="line-through">
          00
        </span>{" "}
        Already scheduled, skipped
      </li>
    </ul>
  );
}

function ConflictIcon({ conflict }: { conflict: OccurrenceConflict }) {
  const className = "mt-0.5 size-3.5 shrink-0";
  if (conflict.kind === "coach") return <UsersIcon aria-hidden className={className} />;
  return <CopyXIcon aria-hidden className={className} />;
}

export function conflictLabel(conflict: OccurrenceConflict): string {
  const other = `${sessionDisplayName(conflict.session)} at ${formatSessionTime(conflict.session.startsAt)}`;
  if (conflict.kind === "coach") {
    return `${conflict.coachNames.join(" and ")} already ${conflict.coachNames.length > 1 ? "teach" : "teaches"} ${other}`;
  }
  return `${other} is already on the schedule`;
}

function describe(row: PlannedOccurrence, skipped: boolean): string {
  if (skipped) return `${row.ymd}: already scheduled, will be skipped`;
  if (row.conflicts.length === 0) return row.isFirst ? `${row.ymd}: first session` : row.ymd;
  return `${row.ymd}: ${row.conflicts.map(conflictLabel).join("; ")}`;
}

function shortDate(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${ymd}T00:00:00Z`));
}
