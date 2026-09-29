# Spec: FE public screens

## Requirements

1. Landing section order is header → hero copy → calendar hero → session panel → How it works → Classes → Coaches → About → walk-in/location → final CTA → footer. The final CTA routes to `/book/calendar`. The homepage retains its inline quick/calendar switch.
2. Guest Reserve / Join Waitlist goes to `/login?returnTo=` for the selected session. Full, closed, past, and cancelled sessions are not reservable and render distinct panel copy.
3. About contains the six spec blocks; How Booking Works is Calendar → Reserve → Pay → Confirm (admin confirms). View Schedule routes to `/book/calendar`.
4. Contact renders verified findings details, no invented hours, walk-in QR → account → same calendar, and a mocked form (validation, submitting, success, failure) with no network call. Channels are not a booking path.
5. FAQs expose Booking, Payment, Waitlist, Cancellation/Reschedule, and Walk-ins with canonical answers. Cancellation/reschedule copy has no deadline or refund-eligibility rule. Search filters client-side. Contact Us goes to `/contact`.
6. Coaches cards show photo, name, specialty, short bio, and View Classes only. Filters come from fixture specialties. View Classes applies `coachId` on `/book/calendar`. Public props never include rate or cost. Roster matches findings.md §4b.
7. Published session packages appear at `/packages` and `/packages/[slug]`. Drafts and archives are omitted. Coach compensation never appears. See `openspec/specs/session-bundles.md`.

8. Public booking discovery has two dedicated routes: `/book/quick` (Class → Time → Review) and `/book/calendar` (responsive calendar). Both reuse the homepage booking hero and `ScheduleCalendarSection`, read `loadPublicSchedule()` via the mock adapter, and preserve the selected session through login. Mode links navigate between routes and preserve incoming `classId` / `coachId` filters. Clearing calendar filters stays on the current booking route.
9. General “Book a class” / “Find your next class” entry points use `/book/quick`. Schedule links, footer/closing schedule CTAs, and coach/class-filtered discovery use `/book/calendar`; they must not return visitors to the landing page. Direct links for an already selected session retain `/portal/book/[sessionId]`. The floating mobile booking CTA is hidden on both dedicated booking pages.
