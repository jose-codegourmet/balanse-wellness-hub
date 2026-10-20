# Change: Per-session change rules (#380)

## Why

One-off events (charity classes, guest coaches) cannot be moved, yet every booking could open a cancellation or reschedule request and nothing on the public page or the reservation step warned the customer that a session was final. `GymSession` only had `bookable`, which stops new reservations, and the two request routes gated nothing at session level.

## What

### Data and API

- `GymSession.cancellable` and `reschedulable`, both `Boolean @default(true)`; migration `20261020120000_session_change_rules`. Existing rows keep today's behaviour. Duplicate and recurrence copy both from the template (`generatedSessionData`).
- `FIELD_CONSTRAINTS.session` entries; session `POST` defaults both to `true`, `PATCH` leaves an omitted flag unchanged. `AdminSession`, `PublicSession`, `PublicSessionPage`, the customer booking's `session`, and `AdminEventSessionSnapshot` expose both fields. The public session and event detail routes read the two columns beside their `app_public` RPCs instead of widening the RPC row types.
- `POST /api/bookings/{id}/cancellation-request` → `409 booking_not_cancellable`; `POST /api/bookings/{id}/reschedule-request` → `409 booking_not_reschedulable` (origin session only). OpenAPI regenerated with the fields and codes.
- `@balanse/domain` `session-change-rules.ts`: labels ("No cancellations", "No reschedules"), the acknowledgement sentence, the notice, and `sessionChangeRuleLabels`; `customerBookingActions(status, session)` now removes the refused request.

### Admin (`apps/admin`)

- Session form, Visibility section: "Customers can request cancellation" and "Customers can request a reschedule" switches (default on), helper "Turn off for one-off events…", and an inline warning with the held + confirmed count when a rule is turned off on a session that already has bookings. Schema, defaults, submit mapping, summary panel fact, selected-session panel badges, and event detail line.
- Storybook mock adapter and fetcher carry the flags; the mock request methods mirror the 409s.

### Customer and public (`apps/web`)

- Public session page hero badges, `PublicSessionDetails` "Changes" fact (session and event pages), and the calendar's selected-session panel row.
- Booking form: "Changes" hero fact, an advisory section above "Waivers and policies", and a required "I understand this reservation cannot be cancelled / rescheduled." checkbox (`makeBookingFormSchema`) that keeps the reserve / waitlist button disabled until ticked.
- Booking detail hides the refused action and adds an informational advisory; `/cancel` and `/reschedule` render the notice with Back to booking instead of the form so deep links cannot bypass the rule.

## Decisions (Jose, 2026-10-20)

1. Public wording is the plain "No cancellations" / "No reschedules"; no "Final" lead-in.
2. New events keep the session default (both on); admin flips the switches for one-offs.
3. Admin may turn a rule off after customers have booked; the form warns inline rather than locking.
4. A studio-cancelled non-cancellable session keeps manual refund handling (canonical rule 47).

These switches are capabilities, not deadlines or price rules: canonical rules 42–51 and 63–64 stay as they are.

## Out of scope

A booking confirmation email line (the repo's `emails/` folder holds only Supabase auth templates; there is no booking email template to extend), per-booking overrides, and automatic enforcement of any cancellation deadline.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`; route contract tests; `@balanse/mock` tests. The ten `@balanse/domain` test failures (navigation hrefs, feedback catalogue size, a gross-sales sum) pre-date this change and fail identically on `main`.
- Storybook: `Customer/BookingForm › FinalSession` at 360 / 768 / 1280; admin session form Visibility section.
