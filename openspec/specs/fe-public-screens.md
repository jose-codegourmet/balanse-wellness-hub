# Spec: FE public screens

## Requirements

1. Landing section order is header → hero copy → calendar hero → session panel → How it works → Classes → Coaches → About → walk-in/location → final CTA → footer. The final CTA hashes to `#schedule`.
2. Guest Reserve / Join Waitlist goes to `/login?returnTo=` for the selected session. Full, closed, past, and cancelled sessions are not reservable and render distinct panel copy.
3. About contains the six spec blocks; How Booking Works is Calendar → Reserve → Pay → Confirm (admin confirms). View Schedule routes to the landing calendar.
4. Contact renders verified findings details, no invented hours, walk-in QR → account → same calendar, and a mocked form (validation, submitting, success, failure) with no network call. Channels are not a booking path.
5. FAQs expose Booking, Payment, Waitlist, Cancellation/Reschedule, and Walk-ins with canonical answers. Cancellation/reschedule copy has no deadline or refund-eligibility rule. Search filters client-side. Contact Us goes to `/contact`.
6. Coaches cards show photo, name, specialty, short bio, and View Classes only. Filters come from fixture specialties. View Classes applies `coachId` on the landing calendar. Public props never include rate or cost. Roster matches findings.md §4b.
