# Meta — FE admin polish (FE-SHR-007–013, FE-ADM-015–032)

Issues: #198–#205, #207–#223 under epic #197. BE contract children #224–#228 (also under #197).

Epic #179 (portal & public polish) shipped without an OpenSpec or `docs/metas/` record. That drift is noted here only — it is not retro-documented.

## Issues covered

| Wave | Tickets | Issues | Merged PRs |
| --- | --- | --- | --- |
| 0 shared foundation | `FE-SHR-007`–`012` | #198–#203 | #230, #235, #234, #232, #231, #233 (+ hotfix #236) |
| 1 admin infrastructure | `FE-ADM-015`–`021` | #204, #205, #207–#211 | #237, #239, #241, #243, #244, #242, #238 |
| 2 pages | `FE-ADM-022`–`032` | #212–#222 | #248, #250, #247, #251, #246, #253, #249, #252, #254, #256, #255 |
| 3 closeout | `FE-SHR-013` | #223 | this change |
| BE contracts | `BE-050`–`054` | #224–#228 | #229 (pack); see status below |

Batch D-0 shared primitives landed as `9dfb677` on `main` before the page PRs.

## Delivered this phase

### Shared primitives (`@balanse/ui`)

- Component authoring standard + `docs/component-guide.md` (`FE-SHR-007` / #198)
- Field primitives hardened: `Button`, `Field` / `FieldLabel` / `FieldError`, `Input`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`, `NativeSelect` (`FE-SHR-008` / #199)
- `DatePicker`, `DateRangePicker`, `TimePicker` (`FE-SHR-009` / #200)
- `RichTextarea` (Markdown assumption; stored format still a BE note) (`FE-SHR-010` / #201)
- `Badge` + `StatusBadge` redesign; `CountBadge` (`FE-SHR-011` / #202)
- Page-skeleton kit: `TablePageSkeleton`, `CardListSkeleton`, `FormPageSkeleton`, `BentoSkeleton`, `DetailPageSkeleton`, `CalendarSkeleton` (`FE-SHR-012` / #203)

### Admin infrastructure (`apps/admin`)

- React Query layer: `adminKeys`, `queries.ts`, `mutations.ts`, `prefetchAdmin` + `HydrationBoundary`. Keys are `["admin", role, …]`. Sidebar dashboard counts share `adminDashboardQuery` (`FE-ADM-015` / #204)
- Collapsible sidebar + shell; collapse persisted via `ADMIN_SIDEBAR_COOKIE`; mobile drawer unchanged in role (`FE-ADM-016` / #205)
- `AdminDataTable` v2 on `@tanstack/react-table` (toolbar, URL prefs, faceting, pagination, row actions). Dead `DataTable({ columns })` helper removed (`FE-ADM-017` / #207)
- `AdminPageShell` + per-route `loading.tsx` skeletons + prefetch wiring (`FE-ADM-018` / #208)
- Form kit: `AdminForm`, colocated zod schemas, bindings (including `DateBinding` / `TimeBinding` / `RichTextBinding` / `ImageBinding` / `ComboboxBinding`), unsaved-changes guard, `notify.admin` (`FE-ADM-019` / #209)
- `AdminQueueList` + `AdminQueueCard`; `@tanstack/react-virtual` above a 30-item threshold; mock `CursorPage` + ~120 generated queue rows (`FE-ADM-020` / #210)
- Storybook split per module; preview globals for theme / principal / `mockRuntime`; local a11y runner (`FE-ADM-021` / #211)

### Pages

- `/dashboard` — 12/6/1 bento, `DashboardTile` / `NeedsAttentionTile`, `SalesSeriesChart` from fixture series (no digit-fabricated sparklines), today's schedule table (`FE-ADM-022` / #212)
- `/payments` — tabbed notification queue, infinite query, virtualized cards, proof panel (`FE-ADM-023` / #213)
- `/cancellations` — same queue pattern; refund actions refresh via query invalidation (`FE-ADM-024` / #214)
- `/reschedules` — same queue pattern; customer display name on the card (`FE-ADM-025` / #215)
- `/classes` — `AdminDataTable` list, status/duration/price columns, no compensation fields (`FE-ADM-026` / #216)
- `/classes/new` + `/classes/[classId]` — `AdminWizard` (desktop intercept modal, mobile page), three steps, form kit (`FE-ADM-027` / #217)
- `/coaches` — headshots via `CoachPhoto` / `photoKey`, specialty facets, rates only for the admin principal (`FE-ADM-028` / #218)
- `/coaches/new` + `/coaches/[coachId]` — desktop tabs / mobile page (photo, public profile, internal financials, upcoming sessions); `MockImageUpload` still (`FE-ADM-029` / #219)
- `/schedule` — calendar day click → add-session href; `/schedule/new` + edit use `AdminWizard` + session form kit; no recurrence control (`FE-ADM-030` / #220)
- `/customers` — roster stats (total / upcoming / active in 30 days / never visited) as filter tiles; split email/phone columns; faceted filters; relative last-visit line (`FE-ADM-031` / #221)
- `/settings` — four tabs (business, payment, public content, policies); FAQ `useFieldArray` add/remove/reorder; per-document policy promotion; GCash QR still mock upload (`FE-ADM-032` / #222)

### Domain / mock

- Shared mock clock (`MOCK_NOW_ISO` / `adminNowIso`); `formatRelativeTime`; `CursorPage` + `sliceCursorPage`; `FIELD_CONSTRAINTS` consumed by admin forms

## Not delivered

- No FE↔BE wiring. Screens do not `fetch` `/api/*`. `@balanse/api` handlers exist and are mounted on `apps/web` `/api/*`; the admin UI does not call them.
- No real file upload for coach photos or the GCash QR (`MockImageUpload` / pending `photoKey` only). Replace/remove is mock-local.
- No recurring session generation (still out of MVP).
- No per-route `error.tsx` copy. One `(dashboard)/error.tsx` covers the segment.
- `/bookings`, `/staff`, `/reports`, and the session roster were migrated onto `AdminPageShell` / `AdminDataTable` (or kept as card lists for roster) and were **not** redesigned. Booking detail still calls `getMockAdapter()` for some actions instead of the mutation hooks.
- Customer **detail** was only mechanically updated (`AdminPageShell`, breadcrumb, `StatusBadge` / `Badge`). The six spec blocks remain; layout was not redesigned.
- `/login` was not in this wave.
- Mock harness is still on. `MockRuntimeOptions`: `latencyMs`, `failNext`, `failPublicSessions`, `sessionBecameFullId`, `failProofUpload`, `emptyAdminQueues`.
- No Vercel/prod deploy (separate FE-lead step after #223).
- Epic #179 still has no OpenSpec / meta of its own.

## BE contract tickets

Contract pack landed on `main` as PR #229 (`feat(api): BE-050–054 admin contract pack`). Docs: `docs/backend/admin-pagination.md`, `validation-contracts.md`, `uploads.md`, `settings-write.md`, `dashboard-metrics.md`. Shared types in `@balanse/domain` (`CursorPage`, `ValidationFailedBody`, `FIELD_CONSTRAINTS`, `MetricSeries`, `SignedUploadIntent`).

| Ticket | Issue | GitHub | What exists on `main` |
| --- | --- | --- | --- |
| `BE-050` | #224 | **closed** by #229 | Cursor pagination envelope + admin list handlers |
| `BE-051` | #225 | **open** | Validation tables + 422 shape in domain/docs; FE notes field-name and money-unit divergence on the issue |
| `BE-052` | #226 | **open** | Upload contract docs/types; FE still mock-only |
| `BE-053` | #227 | **open** | Settings write / FAQ / policy contract docs; FE still mock adapter |
| `BE-054` | #228 | **open** | Dashboard metrics contract; FE chart reads mock snapshot series |

These are not FE blockers. Wiring is `WIRE-*`.
