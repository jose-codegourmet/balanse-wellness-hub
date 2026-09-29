import type { AdminVenue, SessionStatus } from "@balanse/domain";
import type { PlannedOccurrence } from "../../../_lib/session-occurrences";

export const sessionSummaryPanelMeta = {
  purpose:
    "Live summary beside the session form: what the session looks like, where and when it runs, every date a repeat will create, and any coach or venue clashes.",
  whenToUse: "Right column of SessionFormPage (below the form on narrow screens).",
  whenNotToUse: "Read-only. Never put inputs here; the form on the left owns every value.",
} as const;

export type SessionSummaryPanelProps = {
  /** The gym class name (not a CSS class). */
  gymClassName: string;
  heroImage: string | null;
  sessionName: string;
  startsAt: string;
  endsAt: string;
  venue: Pick<AdminVenue, "name" | "address" | "kind"> | null;
  coachNames: string[];
  capacity: number;
  pricePhp: number;
  status: SessionStatus;
  bookable: boolean;
  occurrences: readonly PlannedOccurrence[];
  /** Admin-only rate snapshot lines. Omit when the viewer lacks coach_rates.read. */
  rateLines?: { coachName: string; label: string; note: string }[];
  editing: boolean;
};
