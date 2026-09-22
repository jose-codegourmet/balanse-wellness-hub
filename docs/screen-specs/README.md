# Balanse Screens — Rough Layout Specs

These screen specs are the UI companion to the Balanse business docs.

Canonical assumptions carried into the screens:
- Public experience is calendar-first.
- Mobile = day view, tablet = week view, desktop = month view.
- Guests can browse; authentication is required to reserve or join waitlist.
- Customers book only for themselves.
- Booking requires applicable waiver/policy acceptance.
- MVP payments are GCash proof upload or Pay at Counter.
- Reservation hold defaults to 8 hours, capped by class start.
- New bookings/waitlist promotions default to closing 15 minutes before class.
- Waitlist is FIFO.
- Admin manually reviews payments and confirms bookings.
- Cancellation/reschedule are requests, not instant self-service mutations.
- Refunds are manual; no store credit in MVP. Session packages (BE-058) are session credits, not wallets.
- Admin performs check-in; no-show means no refund.
- Coaches do not manage their own schedules in MVP.

Folders:
- `public/`
- `customer/`
- `admin/`
- `shared/`

## Marketing image-generation prompts

All public/marketing screen specs include prompt ideas where imagery, backgrounds, section accents, or editorial visual assets could materially improve the design.

See `shared/04-marketing-image-generation.md` for the common Higgsfield / Nano Banana Pro / GPT Image 2 prompt conventions.

The prompts intentionally avoid generating core product UI such as the interactive calendar; those elements should remain coded and functional.
