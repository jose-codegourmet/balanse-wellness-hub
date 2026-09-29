import type { PlannedOccurrence } from "../../_lib/session-occurrences";

export const occurrencePreviewMeta = {
  purpose:
    "Mini month calendars of every date a session or series will be created on, marking the first date, dates that will be skipped as exact duplicates, and dates where a chosen coach is already teaching.",
  whenToUse:
    "Beside the session form and on the Repeat weekly page. Feed it planOccurrences() from schedule/_lib/session-occurrences.",
  whenNotToUse:
    "Not a schedule browser; use AdminScheduleCalendar for that. It never blocks saving: sessions may share a time and a venue, and coach clashes are warnings only.",
} as const;

export type OccurrencePreviewProps = {
  occurrences: readonly PlannedOccurrence[];
  /** Months to draw before collapsing the rest into a count. */
  maxMonths?: number;
  /** Conflicts to list under the calendars. */
  maxConflicts?: number;
  className?: string;
};
