import type { PublicRoster } from "@balanse/domain";

/**
 * # PublicRoster (#348, reused by #349)
 *
 * "Who's going" block on the public session and event pages. Renders the
 * `PublicRoster` union from `getPublicRoster(sessionId, viewer)`:
 *
 * - `visibility: "counts"` (guest): "X going · Y spots left", anonymous
 *   placeholder circles, and **Sign in to see who's going** / **Create an
 *   account** (both carry `returnTo` back to this page).
 * - `visibility: "list"` (signed-in customer): avatar + display name grid.
 *   The viewer's own row is first with a **You** badge; if they opted out it
 *   says only they can see it, with a link to the profile setting. Opted-out
 *   others collapse into "+N others".
 *
 * Attendees are not links and have no hover cards. Copy says "going", never
 * "applicants" or "bookings".
 *
 * `state`: `live` (default), `cancelled` (muted, "This session was
 * cancelled."), or `ended` (muted list, still visible to signed-in viewers).
 *
 * Privacy: the component only ever receives display-only rows. Never extend it
 * to accept last names, ids, or booking status.
 */
export type PublicRosterProps = {
  roster: PublicRoster;
  /** `/login?returnTo=<this page>` */
  loginHref: string;
  /** `/sign-up?returnTo=<this page>` */
  signUpHref: string;
  state?: "live" | "cancelled" | "ended";
  /** Where "Change" goes for an opted-out viewer. */
  profileHref?: string;
  headingId?: string;
};

export const publicRosterMeta = {
  purpose: "Who's going block: counts for guests, display names + avatars for customers.",
  whenToUse: "Public session and event pages only.",
  whenNotToUse: "Admin rosters (use the admin roster page with full identity).",
} as const;
