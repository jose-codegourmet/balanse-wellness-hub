# Tasks: Customer schedule shows the full timetable; session dialog coach roster

Status: implemented in the working tree on 2026-10-13, not yet committed. `fe-public-screens` req 2 already carries the dialog behaviour in the base.

- [x] `ScheduleCalendarSection`: remove booking scoping and the customer-only initial loading state.
- [x] `/portal/schedule` page copy and metadata.
- [x] `BalanseBookingCalendar`: coach roster section, scrollable summary + fixed footer, customer copy; `booking-calendar.css`; `ManyCoaches` story; `BalanseBookingCalendar.meta.ts`.
- [ ] `docs/screen-specs/customer/07-schedule.md`: reconcile with the full-timetable behaviour (the spec may still describe a booked-only calendar).
- [ ] `docs/screen-specs/public/` session dialog note for the coach roster, if the dialog is specified there.

## Files in this change

- `apps/web/src/modules/schedule/ScheduleCalendarSection.tsx`
- `apps/web/src/app/(portal)/portal/schedule/page.tsx`
- `apps/web/src/components/balanse/calendar/BalanseBookingCalendar.tsx`, `BalanseBookingCalendar.stories.tsx`, `BalanseBookingCalendar.meta.ts`, `booking-calendar.css`
- `openspec/specs/fe-public-screens.md` (req 2 addition)
