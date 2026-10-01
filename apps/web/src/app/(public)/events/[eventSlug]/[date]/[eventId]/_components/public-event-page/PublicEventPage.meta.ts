import type { PublicEventPage, PublicRoster } from "@balanse/domain";

/**
 * # PublicEventPage (#349)
 *
 * Shareable public page for a `SessionEvent` at
 * `/events/<event-title-slug>/<YYYY-MM-DD Manila>/<eventId>`. The slug is
 * derived from the title at render time (no stored slug); a renamed title or
 * moved session 301s to the canonical path keeping `ref` / `src` / `via`.
 * DRAFT and ARCHIVED events 404.
 *
 * Leads with the event story — poster (site paths only; object keys fall back
 * to the class hero), title, summary, "About this event", Supporting
 * (beneficiary), What to bring, gallery — then reuses the session page blocks:
 * `PublicSessionDetails` (facts + coaches), `PublicRoster`, `PublicBookingBar`.
 *
 * Registration window: before it opens the booking action is disabled with
 * "Registration opens …"; after it closes, "Registration closed". The session
 * booking cutoff still applies. Cancelled (event or session) → banner, no
 * booking action, link still shareable, no poster. Past → banner thanking
 * supporters of the beneficiary, no share.
 *
 * Never renders `internalNotes`; the payload does not carry it.
 */
export type PublicEventPageProps = {
  event: PublicEventPage;
  roster: PublicRoster;
  viewer: { customerId: string } | null;
  existingBookingId: string | null;
  currentPath: string;
  share: { url: string; posterUrl?: string; fileSlug: string } | null;
  nowIso: string;
};

export const publicEventPageMeta = {
  purpose: "Shareable public event page: story, beneficiary, coaches, who's going, booking.",
  whenToUse: "Route /events/[eventSlug]/[date]/[eventId] only.",
  whenNotToUse: "Plain sessions (use PublicSessionPage) or admin event screens.",
} as const;
