import type { Weekday } from "@balanse/domain";

export const repeatPickerMeta = {
  purpose:
    "Choose how a session repeats: not at all, weekly on its own day, every weekday, or custom days, and when the series ends.",
  whenToUse:
    "Inside the session form (create only) and the Repeat weekly page. The parent owns the values and passes field errors.",
  whenNotToUse:
    "Not for copying a whole date range; that is DuplicateScheduleForm. Holiday exceptions and per-date edits are out of scope.",
} as const;

export type RepeatMode = "none" | "weekly";

export type RepeatValue = {
  mode: RepeatMode;
  weekdays: Weekday[];
  /** Last date the series may run on (YYYY-MM-DD, inclusive). */
  endsOn: string;
};

export type RepeatPickerProps = {
  value: RepeatValue;
  onChange: (next: RepeatValue) => void;
  /** First date of the series. Drives the presets and the "ends after" chips. */
  anchorYmd: string;
  /** Hide "Does not repeat" (the Repeat weekly page always repeats). */
  allowNone?: boolean;
  errors?: { weekdays?: string; endsOn?: string };
  today?: string;
};
