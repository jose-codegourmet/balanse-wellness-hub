/**
 * # RosterVisibilitySetting (#351)
 *
 * The profile "Privacy" sub-section: a switch **Show me on class rosters**
 * (`showOnPublicRoster`, default on) with the explanation that opted-out
 * members are counted but not named or pictured, while coaches and staff can
 * still see them.
 *
 * Saves immediately (no form, no Save button): the switch flips
 * optimistically, `onChange(next)` persists it, and a failure rolls back with
 * an error toast. Success shows a short toast. The route wires `onChange` to
 * `patchMyProfileAction({ showOnPublicRoster })`.
 *
 * Opt-out is enforced by the adapter / database, never by this UI alone.
 */
export type RosterVisibilitySettingProps = {
  checked: boolean;
  /** Persist the new value. Resolve to an error message, or null on success. */
  onChange: (next: boolean) => Promise<string | null>;
  disabled?: boolean;
};

export const rosterVisibilitySettingMeta = {
  purpose: "Let a customer opt out of being named on public class rosters.",
  whenToUse: "Inside the portal profile Basic profile section.",
  whenNotToUse: "Admin rosters (staff always see everyone).",
} as const;
