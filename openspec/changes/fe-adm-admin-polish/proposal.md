# OpenSpec — FE admin polish (FE-SHR-007–013, FE-ADM-015–032)

## Why

`FE-ADM-001`–`014` shipped mocked admin screens, but the admin app never received the field kit, query layer, tables, or page pass that the portal later got. Epic #197 records that wave. OpenSpec had no admin capability and no change proposal for it.

## What

- Field-component family in `@balanse/ui`: hardened `Button` / `Field` / `Input` / `Textarea` / `Checkbox` / `Switch` / `RadioGroup` / `NativeSelect`, plus `DatePicker`, `DateRangePicker`, `TimePicker`, and `RichTextarea`
- Badge and page-skeleton systems: `Badge` / `StatusBadge` / `CountBadge`; `TablePageSkeleton`, `CardListSkeleton`, `FormPageSkeleton`, `BentoSkeleton`, `DetailPageSkeleton`, `CalendarSkeleton`
- Admin React Query layer (`adminKeys`, query/mutation factories, `prefetchAdmin` + `HydrationBoundary`) over `getMockAdapter()`
- Collapsible admin shell (cookie-persisted desktop collapse, mobile drawer)
- `AdminDataTable` v2 on `@tanstack/react-table` (toolbar, URL state, faceting, row actions)
- Virtualized notification queues (`AdminQueueList` + `@tanstack/react-virtual` + mock `CursorPage`)
- Admin form kit (`AdminForm` + colocated zod schemas + bindings + `notify.admin`)
- Eleven page redesigns: `/dashboard`, `/payments`, `/cancellations`, `/reschedules`, `/classes`, `/classes/[classId]` + `/classes/new`, `/coaches`, `/coaches/[coachId]` + `/coaches/new`, `/schedule` + `/schedule/new`, `/customers`, `/settings`

## Out of scope

FE↔BE wiring (`WIRE-*`), mounting `@balanse/api` from the UI, real Storage uploads, recurring sessions, per-route `error.tsx` copy, redesign of `/bookings` / `/staff` / `/reports` / roster / login, retro-documenting epic #179, Vercel/prod deploy, mock-harness removal.
