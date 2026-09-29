# Spec — Customer portal mocks

- Auth screens follow `docs/screen-specs/customer/01-login.md`–`03-forgot-password.md`
- Portal surfaces follow `04`–`13` with human-readable statuses only
- Reserve from a guest calendar keeps the session in `returnTo`
- Customer Reserve skips the auth interstitial
- Hold deadline is `min(reserved_at + 8h, class_start)` and is not editable
- GCash proof upload never auto-confirms
- Cancellation and reschedule are requests; slots stay held
- Packages at `/portal/packages` follow `docs/screen-specs/customer/14-packages.md` and `openspec/specs/session-bundles.md`. Do not fetch `/api/*`.

- Booking tickets, list cards, and shared summaries lead with a large state band, distinct icon, and canonical status label: brand champagne with a double-ring seal for confirmed/checked-in, muted-brown ink with a square seal for cancelled/not-confirmed/expired, warm cream with a dashed seal for pending requests/payment and waitlist, and quiet cream for history. Large display-serif labels remain prominent; no traffic-light colors. Cancellation/reschedule requests explicitly retain the held slot. Refund status is secondary and never replaces the booking state. Only confirmed/checked-in detail pages use the “Booking confirmation” heading; others say “Booking details”. Status remains readable without color and in print.
