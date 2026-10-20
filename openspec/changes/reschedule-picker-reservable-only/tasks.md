# Tasks: Reschedule picker shows only requestable sessions (#379)

Status: implemented on branch `fix/379-reschedule-picker` on 2026-10-20.

## FE — customer

- [x] `rescheduleRange(nowIso)` + `RESCHEDULE_WINDOW_DAYS` next to `showcase-range.ts`.
- [x] `RescheduleForm`: `nowIso` prop, rolling window query, reservable + future filter, disabled-row branch and `unavailableReason` removed, legend and empty copy updated; meta updated.
- [x] `reschedule/page.tsx` computes `nowIso` once and prefetches the matching window.
- [x] Stories: Default, Mobile, Empty.
- [x] `docs/screen-specs/customer/13-reschedule-request.md`; `openspec/specs/fe-customer-screens.md` bullet; README change row.
- [ ] Retire or re-point the story-only legacy `modules/customer/RescheduleRequest.tsx` (separate task).

## Files in this change

Shared files: `openspec/README.md`.

- `apps/web/src/modules/schedule/reschedule-range.ts`
- `apps/web/src/app/(portal)/portal/bookings/[bookingId]/reschedule/page.tsx`
- `apps/web/src/app/(portal)/portal/bookings/[bookingId]/reschedule/_components/reschedule-form/RescheduleForm.tsx`, `RescheduleForm.meta.ts`, `RescheduleForm.stories.tsx`
- `docs/screen-specs/customer/13-reschedule-request.md`
- `openspec/specs/fe-customer-screens.md`
- `openspec/changes/reschedule-picker-reservable-only/**`
