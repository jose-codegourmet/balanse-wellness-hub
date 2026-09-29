import type { AdminCoach } from "@balanse/domain";

export const coachTilePickerMeta = {
  purpose:
    "Choose one or more coaches for a session from photo tiles. Coaches who teach the chosen class come first, and coaches already teaching at that time are flagged.",
  whenToUse: "The Who section of the session form.",
  whenNotToUse:
    "Does not show or edit coach rates; rate snapshots stay in the summary panel for staff with coach_rates.read.",
} as const;

export type CoachTilePickerProps = {
  coaches: readonly AdminCoach[];
  value: readonly string[];
  onChange: (coachIds: string[]) => void;
  /** The chosen class's coach roster. Listed first with a "Teaches this class" tag. */
  recommendedIds?: readonly string[];
  /** Coach id → what they already teach at this time. Shown as a warning, never blocking. */
  busy?: ReadonlyMap<string, string>;
  invalid?: boolean;
};
