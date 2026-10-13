# Change: Customer schedule shows the full timetable; session dialog coach roster

## Why

`/portal/schedule` filtered the calendar down to sessions the customer had already booked, so a signed-in customer had to leave the portal to find a class to book, and the page started in a loading state while that scope loaded. The session dialog also stacked one block per coach with a "Coach" label and a divider each, which broke the layout for multi-coach sessions and pushed the Reserve button below the fold on phones.

## What

- `ScheduleCalendarSection` no longer scopes sessions or classes to the customer's bookings. The portal shows the same bookable timetable as the public calendar; the customer's own sessions are marked through `viewerBookingSessionIds`. The component starts without a forced loading state; empty-period copy is "No classes scheduled…".
- `/portal/schedule` copy: "Pick a class to reserve a spot. Your bookings show on the calendar too." Calendar heading copy and `aria-label` updated for the customer audience ("Class schedule with your bookings").
- `BalanseBookingCalendar` session dialog: coaches are grouped under one heading ("Your coach" / "Your coaches · N") in a compact two-column roster with avatars and wrapping names; a single coach spans the row. The details region scrolls inside the viewport-bounded dialog while capacity, Reserve / Join Waitlist and the share row stay in a fixed footer. New `ManyCoaches` story and `BalanseBookingCalendar.meta.ts`.

## Decisions (Jose, 2026-10-13)

- The portal calendar is a booking surface, not a "my bookings" view; `/portal/bookings` remains the list of the customer's bookings.
- No per-coach role label in the dialog; everyone listed is a coach.

## Out of scope

Overnight continuation chips on the customer calendar (see `schedule-day-timeline` follow-up), and a "mine only" toggle on the portal calendar.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`
- Manual at 375 px and 1280 px: open a six-coach session, scroll the details, confirm the Reserve button stays visible; confirm a booked session shows "This class is on your schedule" while unbooked ones show Reserve.
