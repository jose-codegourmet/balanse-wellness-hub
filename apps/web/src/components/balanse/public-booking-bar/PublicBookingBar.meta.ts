import type { PublicSessionPage } from "@balanse/domain";

/**
 * # PublicBookingBar (#348, reused by #349)
 *
 * The single booking action on public session/event pages, in priority order:
 *
 * 1. Cancelled (session, or `cancelled` for a cancelled event) → no button,
 *    "This session was cancelled."
 * 2. Past → "See upcoming <class> sessions" → `/book/calendar?classId=`.
 * 3. Viewer already booked → "View my booking" → `/portal/bookings/[id]`.
 * 4. Event registration window: before open → disabled "Registration opens …";
 *    after close → disabled "Registration closed". The canonical booking
 *    cutoff still applies on top (step 5).
 * 5. `past_cutoff` → disabled "Booking closed".
 * 6. `full_with_waitlist` → "Join waitlist" (`?intent=waitlist`); otherwise
 *    "Book this session" → `/portal/book/[id]`. Guests go through
 *    `/login?returnTo=` because the portal guard returns to `/portal` only.
 *
 * Desktop renders inline; mobile renders a sticky bottom bar plus a spacer.
 */
export type PublicBookingBarProps = {
  session: PublicSessionPage;
  /** Signed-in customer, or null for a guest. */
  viewer: { customerId: string } | null;
  existingBookingId?: string | null;
  /** Event pages only. */
  registrationWindow?: {
    registrationOpensAt: string | null;
    registrationClosesAt: string | null;
  } | null;
  /** Event cancelled even though the session is live. */
  cancelled?: boolean;
  nowIso: string;
};

export type PublicBookingAction =
  | {
      kind: "link";
      label: string;
      href: string;
      variant: "accent" | "default" | "outline";
      note?: string;
    }
  | { kind: "disabled"; label: string; note?: string }
  | { kind: "none"; note: string };

export const publicBookingBarMeta = {
  purpose: "One booking action for public session/event pages, sticky on mobile.",
  whenToUse: "Public session and event pages.",
  whenNotToUse: "Calendar rows or portal screens (they have their own CTAs).",
} as const;
