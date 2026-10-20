# Spec — Customer portal screens

- Auth screens follow `docs/screen-specs/customer/01-login.md`–`03-forgot-password.md`
- Portal surfaces follow `04`–`13` with human-readable statuses only
- Reserve from a guest calendar keeps the session in `returnTo`
- Customer Reserve skips the auth interstitial
- Hold deadline is `min(reserved_at + 8h, class_start)` and is not editable
- GCash proof upload never auto-confirms
- Cancellation and reschedule are requests; slots stay held
- Per-session change rules (#380): the public session and event pages, the calendar's selected-session panel, and the booking form show “No cancellations” / “No reschedules” when a session refuses those requests. The booking form then requires an “I understand this reservation cannot be cancelled / rescheduled.” checkbox before reserving or joining the waitlist. Booking detail hides the refused request action and explains why; `/cancel` and `/reschedule` render that notice with Back to booking instead of the form.
- The reschedule picker (`/portal/bookings/[bookingId]/reschedule`) lists only sessions the customer can request now: published, reservable (not ended, full, cancelled, or past cutoff), starting after the page's render instant, within a rolling eight-week window from the start of today in Asia/Manila, grouped by studio day with the nearest first. Unavailable sessions are not rendered as disabled rows. A target that fills or passes cutoff before submit still surfaces the server error on the field. No same-class or price-difference filtering is applied (OQ-2; canonical rules 51 and 64).
- Packages at `/portal/packages` follow `docs/screen-specs/customer/14-packages.md` and `openspec/specs/session-bundles.md`.
- Runtime customer data comes from Supabase Auth and typed `@balanse/api-client` functions through React Query; Storybook alone uses mock fixtures. The booking, payment, request, identity and policy rules live in the corresponding capability specs linked from `openspec/README.md`.

- Booking tickets, list cards, and shared summaries lead with a large state band, distinct icon, and canonical status label: brand champagne with a double-ring seal for confirmed/checked-in, muted-brown ink with a square seal for cancelled/not-confirmed/expired, warm cream with a dashed seal for pending requests/payment and waitlist, and quiet cream for history. Large display-serif labels remain prominent; no traffic-light colors. Cancellation/reschedule requests explicitly retain the held slot. Refund status is secondary and never replaces the booking state. Only confirmed/checked-in detail pages use the “Booking confirmation” heading; others say “Booking details”. Status remains readable without color and in print.
