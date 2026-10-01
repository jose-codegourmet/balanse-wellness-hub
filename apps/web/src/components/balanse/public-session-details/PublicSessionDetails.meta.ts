import type { PublicSessionPage } from "@balanse/domain";

/**
 * # PublicSessionDetails (#348, reused by #349)
 *
 * Session facts (date, time + duration in Asia/Manila, venue name + address,
 * price, spots), the teaching coaches (photo, name, specialties → `/coaches`),
 * and an optional class blurb linking to `/classes/[slug]`.
 *
 * Never shows venue notes, coach rates, or anything staff-only — the
 * `PublicSessionPage` payload does not carry them. Spots are hidden for
 * cancelled and past sessions.
 */
export type PublicSessionDetailsProps = {
  session: PublicSessionPage;
  /** Event pages hide the class blurb in favour of the event story. */
  showClassBlurb?: boolean;
};

export const publicSessionDetailsMeta = {
  purpose: "Facts, coaches, and class blurb for public session/event pages.",
  whenToUse: "Public session and event pages.",
  whenNotToUse: "Portal booking forms (use BookingSummary) or admin screens.",
} as const;
