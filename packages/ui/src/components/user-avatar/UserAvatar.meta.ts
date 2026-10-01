import type { PersonName } from "@balanse/domain";

/**
 * # UserAvatar / UserAvatarStack (#346, epic #343)
 *
 * Customer identity circle used everywhere a member is shown: public roster,
 * portal header and profile, onboarding, admin roster, customers, and Coach
 * Students.
 *
 * - Photo when `avatarUrl` loads; otherwise **initials** (first letter of
 *   first name + first letter of last name) on a deterministic brand tone
 *   from `avatarToneFor(seed)`. A broken image URL falls back to initials.
 * - `placeholder` renders a neutral dashed circle with no initials or image —
 *   used for the signed-out "X going" teaser so nothing identifies anyone.
 * - `UserAvatarStack` overlaps up to `max` avatars, then shows "+N".
 *   `overflowCount` adds people not passed in (e.g. opted-out attendees).
 *
 * ## When not to use
 *
 * - Coaches: keep the existing coach photo / `CoachAvatar` handling.
 * - Never pass a last name to a public surface. Public roster rows carry only
 *   `initials` + `displayName`; pass `nameFromInitials(row.initials)` from
 *   `@balanse/domain` as `name` and `row.displayName` as `label`.
 */

export type UserAvatarSize = "sm" | "default" | "lg" | "xl";

export type UserAvatarProps = {
  /** Used for initials and the default accessible name. Omit with `placeholder`. */
  name?: PersonName;
  avatarUrl?: string | null;
  /** Stable seed for the initials tone (customer id or roster key). Defaults to initials. */
  seed?: string;
  size?: UserAvatarSize;
  /** Accessible name override (e.g. the display name on public surfaces). */
  label?: string;
  className?: string;
  /** Neutral, anonymous circle. Ignores name and image. */
  placeholder?: boolean;
};

export type UserAvatarStackPerson = {
  key: string;
  name: PersonName;
  avatarUrl?: string | null;
  label?: string;
};

export type UserAvatarStackProps = {
  people: UserAvatarStackPerson[];
  /** Max avatars before "+N". Default 5. */
  max?: number;
  size?: UserAvatarSize;
  /** Extra people not in `people` (e.g. hidden attendees) added to "+N". */
  overflowCount?: number;
  /** Anonymous placeholder circles appended after `people` (guest teaser). */
  placeholderCount?: number;
  /** Accessible group label, e.g. "12 going". */
  label?: string;
  className?: string;
};

export const userAvatarMeta = {
  purpose: "Member avatar with photo or initials fallback, plus an overlapping stack.",
  whenToUse:
    "Any customer identity: public roster, portal header/profile, onboarding, admin roster, customers, Coach Students.",
  whenNotToUse: "Coach photos (use the coach photo helpers). Never feed a last name to public UI.",
} as const;
