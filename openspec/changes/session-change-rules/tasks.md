# Tasks: Per-session change rules (#380)

Status: implemented on branch `feat/380-session-change-rules` on 2026-10-20.

## BE

- [x] Prisma columns + migration; `generatedSessionData` copies both flags.
- [x] `FIELD_CONSTRAINTS.session`, `PublicSession` / `HttpBooking.session` / `AdminEventSessionSnapshot` fields, `session-change-rules.ts` helpers, `customerBookingActions(status, session)`.
- [x] Session POST/PATCH parse; admin, public list, public detail, public event, booking, and event presenters.
- [x] 409 `booking_not_cancellable` / `booking_not_reschedulable` on the request routes.
- [x] OpenAPI generator (session body fields, error codes) + `openapi.json`; api-client `SessionInput` and `BookingWire.session`.
- [x] `docs/backend/api-routes.md`, `docs/backend/validation-contracts.md`.
- [ ] Apply the migration to the hosted project (`xydundrayuusqizssgby`) on deploy.

## FE — admin

- [x] Session form schema/defaults, submit mapping, Visibility switches + warning, summary panel fact, selected-session badges, event detail line.
- [x] Storybook mock fetcher/adapter, fixtures builder, event snapshot; story fixtures updated.
- [x] `docs/screen-specs/admin/05-schedule-management.md`.

## FE — customer

- [x] Public session page badges, `PublicSessionDetails` fact, calendar selected-session row.
- [x] Booking form schema (`makeBookingFormSchema`), defaults, advisory + checkbox, disabled reserve button, `FinalSession` story.
- [x] Booking detail actions + advisory; `/cancel` and `/reschedule` blocked notices.
- [x] `docs/screen-specs/customer/08`, `11`, `12`, `13`.

## OpenSpec

- [x] Base specs: `catalogue-and-scheduling.md` req 5, `booking-lifecycle.md` req 6, `events.md` req 1, `fe-customer-screens.md`, `fe-admin-screens.md` req 6; README change row.

## Files in this change

Shared files (also touched by other in-flight changes; split with `git add -p` if needed): `packages/domain/src/contracts.ts`, `packages/domain/src/types.ts`, `packages/domain/src/index.ts`, `packages/api/src/handlers/admin-catalogue.ts`, `packages/api/src/handlers/bookings.ts`, `packages/api/src/handlers/public.ts`, `packages/db/scripts/generate-openapi.ts`, `packages/db/contracts/openapi.json`, `packages/mock/src/memory-adapter.ts`, `packages/mock/src/fixtures.ts`, `openspec/README.md`, `docs/backend/api-routes.md`, `docs/backend/validation-contracts.md`.

- `packages/db/prisma/schema/catalogue.prisma`, `packages/db/prisma/migrations/20261020120000_session_change_rules/`
- `packages/domain/src/session-change-rules.ts`, `customer-portal.ts`, `http.ts`, `admin.test.ts` (fixture fields)
- `packages/api/src/handlers/admin-events.ts`
- `packages/api-client/src/bookings.ts`, `sessions.ts`
- `packages/mock/src/adapter.ts`, `event-engine.ts`
- `apps/admin/src/modules/admin/forms/session/session-form.schema.ts`, `session-form.defaults.ts`
- `apps/admin/src/app/(dashboard)/schedule/_components/session-form-page/SessionFormPage.tsx`, `session-summary-panel/*`, `selected-session-panel/SelectedSessionPanel.tsx`, `occurrence-preview/OccurrencePreview.stories.tsx`
- `apps/admin/src/app/(dashboard)/events/_components/event-detail-page/EventDetailPage.tsx`, `EventDetailPage.stories.tsx`
- `apps/admin/.storybook/mock-entity-fetcher.ts`
- `apps/web/src/modules/customer/BookingForm.tsx`, `BookingForm.schema.ts`, `BookingForm.defaults.ts`, `BookingForm.stories.tsx`, `BookingDetail.tsx`
- `apps/web/src/app/(portal)/portal/bookings/[bookingId]/cancel/page.tsx`, `reschedule/page.tsx`
- `apps/web/src/app/(public)/sessions/.../public-session-page/PublicSessionPage.tsx` (+ stories), `apps/web/src/app/(public)/events/.../public-event-page/PublicEventPage.stories.tsx`
- `apps/web/src/components/balanse/public-session-details/PublicSessionDetails.tsx` (+ stories), `public-booking-bar/PublicBookingBar.stories.tsx`, `calendar/BalanseBookingCalendar.tsx`
- `docs/screen-specs/customer/08-booking-form.md`, `11-booking-detail.md`, `12-cancellation-request.md`, `13-reschedule-request.md`, `docs/screen-specs/admin/05-schedule-management.md`
- `openspec/specs/catalogue-and-scheduling.md`, `booking-lifecycle.md`, `events.md`, `fe-customer-screens.md`, `fe-admin-screens.md`
- `openspec/changes/session-change-rules/**`
