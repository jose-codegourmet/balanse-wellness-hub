# Meta — FE shared systems (FE-SHR-001–005)

Issues: #65–#69 under epic #4.

Delivered this phase:

- Navigation catalogs and shells (public, customer, admin) with mobile menus and guest/customer header swap
- Status language map (14 rows) + customer/admin badges
- Empty, loading, and error library (15 states) + localized skeletons
- Marketing asset integration consuming the ASSET manifest and ASSET-014 placeholders
- Responsive mock calendar on the public landing hero and customer schedule

Coach portraits: eight ASSET-013 delivery sets are bundled under `/assets/headshots/`. Cards use `headshot-card-4x5` (+ w400, jpeg fallback); avatars use `headshot-1x1` (+ w400/w200). Masters `headshot-4x5.*` stay on the map. Alec / Sofia / Kate Go stay on ASSET-014 placeholders.

Not delivered: production logo/wreath file (text lockup remains), generated marketing photography for lettered public slots (frames only), live APIs, FE-PUB/CUS/ADM screen copy.

---

# Later shared-system tickets (not in the original #4 meta)

## FE-SHR-006 — portal toast (`#180`, epic #179)

Shipped in PR #189. Never recorded when #179 closed.

Delivered: `BalanseToaster` (Jabkit toast, pristine vendor files) mounted in `apps/web` `Providers`; `notify.success/info/warning/error` + `notify.portal` copy in `@balanse/domain`; wired on booking create, payment method, GCash proof (including `failProofUpload`), cancel/reschedule request, and profile save.

Not delivered: admin toasts (those landed later as `notify.admin` in `FE-ADM-019`), sonner swap, real notifications/email/push. Epic #179 as a whole still has no OpenSpec / phase meta.

## FE-SHR-007–012 — admin polish wave 0 (`#198`–`#203`, epic #197)

See `docs/metas/fe-admin-polish.md` for the full wave. In this package:

- #198 / PR #230 — `docs/component-guide.md` + five-file authoring rule
- #199 / PR #235 — field primitives
- #200 / PR #234 — `DatePicker` / `DateRangePicker` / `TimePicker`
- #201 / PR #232 — `RichTextarea`
- #202 / PR #231 — `Badge` / `StatusBadge` / `CountBadge`
- #203 / PR #233 — page-skeleton kit (`TablePageSkeleton`, `CardListSkeleton`, `FormPageSkeleton`, `BentoSkeleton`, `DetailPageSkeleton`, `CalendarSkeleton`)

## FE-SHR-013 — OpenSpec closeout (`#223`)

Records the admin polish wave. No product code.
