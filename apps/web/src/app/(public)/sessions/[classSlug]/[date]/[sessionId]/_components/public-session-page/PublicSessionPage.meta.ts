import type { PublicRoster, PublicSessionPage } from "@balanse/domain";

/**
 * # PublicSessionPage (#348)
 *
 * Shareable public page for one session at
 * `/sessions/<class-slug>/<YYYY-MM-DD Manila>/<sessionId>`. The route resolves
 * the session (404 for DRAFT), 301s stale slug/date segments to the canonical
 * path (keeping `ref` / `src` / `via`), and loads the viewer context.
 *
 * Layout: hero (class image, title, availability chip, date/time/venue,
 * "Share with friends") → cancelled / ended banner → "Part of <event>" link
 * when the session has a published or cancelled event → details (facts,
 * coaches, class blurb) beside the "Who's going" roster and booking action.
 *
 * - Guests: roster counts + sign-in prompt; booking goes via login `returnTo`.
 * - Signed-in customers: roster names/avatars with "You"; share links carry
 *   their `ref` + `src=customer`; "View my booking" when already booked.
 * - Cancelled: banner, no booking action, link stays shareable, no poster.
 * - Past: banner, no share, "See upcoming <class> sessions".
 */
export type PublicSessionPageProps = {
  session: PublicSessionPage;
  roster: PublicRoster;
  viewer: { customerId: string } | null;
  existingBookingId: string | null;
  /** Current path + query, used for login/sign-up `returnTo`. */
  currentPath: string;
  eventHref: string | null;
  share: { url: string; posterUrl?: string; fileSlug: string } | null;
  nowIso: string;
};

export const publicSessionPageMeta = {
  purpose: "Shareable public session page with coaches, who's going, and booking.",
  whenToUse: "Route /sessions/[classSlug]/[date]/[sessionId] only.",
  whenNotToUse: "Event pages (use PublicEventPage) or the portal booking flow.",
} as const;
