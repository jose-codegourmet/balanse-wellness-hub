# WIRE epics — FE ↔ BE wiring tickets (draft for review)

Status: **reviewed 2026-10-02; filing as GitHub issues.** Each epic is one issue titled `[EPIC] WIRE-Exx — <name>` with its tasks as a checklist (decision 10). Labels: `track:fe`, `track:be`, plus `phase:wire`. Index issue: #377; per-epic numbers in **GitHub issues** below.

Source of truth for the current state: [`api-wiring-crosscheck.md`](./api-wiring-crosscheck.md) (HEAD `28906d2`), `packages/db/contracts/routes.ts`, `packages/api/src/handlers/*`, `packages/mock/src/adapter.ts`, `packages/db/prisma/schema/*.prisma`, and read-only catalog queries against `xydundrayuusqizssgby`.

## Decisions already made

| Decision | Choice |
| --- | --- |
| Data layer | **Per-entity API clients; retire `MockDataAdapter` entity by entity.** No HTTP implementation of the adapter interface. |
| Epic scope | **FE + BE + seeder per entity.** Each epic owns its schema gaps, handler gaps, client, hooks, forms, seed data, and mock removal. |
| Foundations | Hosted database catch-up, shared API client + web React Query setup, admin Supabase Auth + API mount, and a closing **No more mocks** epic. |
| Layering | **React Hook Form → React Query hooks → API client → `/api/*`.** Forms never call the client directly; hooks never build URLs. |

## Conventions every task follows

- **API client**: one workspace package `@balanse/api-client` (`packages/api-client/src/<entity>.ts`) with typed functions per route, shared by both apps. Request/response types live in `@balanse/domain` (`contracts.ts` or a new `http.ts`); the OpenAPI file only carries `GenericSuccess`, so types are hand-written from the handlers' presenters. Money crosses the wire as `php_decimal` strings (`"999.00"`); the client maps to integer pesos (`pricePhp`) at the edge, following the table in `apps/admin/src/modules/admin/forms/README.md` (`defaultCustomerPrice ↔ defaultPricePhp`, `customerPrice ↔ pricePhp`, `defaultRate ↔ defaultRatePhp`, `coachRate ↔ coachRatePhp`).
- **Hooks**: admin keeps `apps/admin/src/lib/query/` but splits `queries.ts` / `mutations.ts` into `lib/query/<entity>.ts` (query factories + `use<Action>` mutations) with keys in `keys.ts`. Web gets the same shape under `apps/web/src/lib/query/` (its `QueryClientProvider` already exists in `modules/providers/Providers.tsx`, unused). Query-key scope comes from the real session (customer id, or staff id + role revision), never from a mock principal.
- **Forms**: admin forms stay on `AdminForm` + `forms/<form>/` schema/defaults + bindings; `onSubmit` calls a mutation hook. Web forms are colocated `kebab-case` folders with `.schema.ts` + `.defaults.ts` per `docs/ways-of-working.md`. 422 `ValidationFailed` bodies map to `form.setError(path, …)` through one shared helper.
- **Server components**: may call the client with the request's access token. The client runs in-process (`dispatch(new Request(...))` from `@balanse/api`) on the server and over HTTP in the browser; both go through the same typed functions.
- **Uploads**: BE-052 lifecycle only — `POST` mint → `PUT` bytes → `POST` confirm with `objectKey`. `MockImageUpload` / `ImageBinding` become a real action binding.
- **Seeders**: extend `packages/db/prisma/seed.ts` with one module per entity (`prisma/seed/<entity>.ts`), idempotent upserts, same guards (`BALANSE_ALLOW_DB_SEED`, `BALANSE_ALLOW_SHARED_PROJECT_SEED`). `isPlaceholder=true` where the column exists (`Coach`, `GymClass`, `GymSession`, `PolicyDocumentVersion`, `SessionEvent`); `(placeholder)` in names elsewhere. Mock hyphen ids (`class-yoga`) are mapped to seed ids (`class_yoga`) through one `seed/ids.ts` map; customer and staff ids become real `auth.users` UUIDs.
- **Mock removal**: the last task of every entity epic removes every **runtime** caller of that entity's adapter methods and fixtures. The methods and fixtures themselves stay in `@balanse/mock`, which WIRE-E03 turns into a Storybook-only dev dependency. Stories keep using `getMockAdapter()`.
- **Definition of done** (every task): `pnpm lint`, `pnpm typecheck`, `pnpm build` pass; `Component.meta.ts` updated when a component's data source changes; no `getMockAdapter()` left in the files the task touched; no new tests unless asked.

## GitHub issues

Index: #377. Filed 2026-10-02.

| Epic | Issue | Tasks |
| --- | --- | --- |
| WIRE-E00 — Hosted database catch-up | #355 | 7 |
| WIRE-E01 — Shared API client and web React Query setup | #356 | 7 |
| WIRE-E02 — Admin Supabase Auth and API mount | #357 | 7 |
| WIRE-E03 — No more mocks (closeout) | #376 | 6 |
| WIRE-E04 — Sessions and Schedule | #361 | 13 |
| WIRE-E05 — Classes | #358 | 7 |
| WIRE-E06 — Coaches | #359 | 5 |
| WIRE-E07 — Venues | #360 | 6 |
| WIRE-E08 — Bookings | #363 | 7 |
| WIRE-E09 — Payments and Refunds | #364 | 6 |
| WIRE-E10 — Cancellations and Reschedules | #365 | 5 |
| WIRE-E11 — Customers and Profile | #362 | 9 |
| WIRE-E12 — Onboarding and Referrals | #366 | 6 |
| WIRE-E13 — Events | #367 | 9 |
| WIRE-E14 — Packages and Bundles | #368 | 6 |
| WIRE-E15 — Staff and Roles | #369 | 5 |
| WIRE-E16 — Settings, Policies, and FAQs | #370 | 9 |
| WIRE-E17 — Payment Accounts (QR collection) | #371 | 7 |
| WIRE-E18 — Reports, Dashboard, Sales, Transactions | #372 | 5 |
| WIRE-E19 — Marketing Insights | #373 | 4 |
| WIRE-E20 — Coach Class-change Requests | #374 | 6 |
| WIRE-E21 — Coach Students | #375 | 3 |

## Waves

| Wave | Epics | Why this order |
| --- | --- | --- |
| 0 | E00 Hosted catch-up, E01 API client + web React Query, E02 Admin auth + API mount | Nothing runs against the hosted project today; admin has no staff token. |
| 1 | E05 Classes, E06 Coaches, E07 Venues, E04 Sessions & Schedule | Catalogue first; every booking depends on it. |
| 2 | E11 Customers & Profile, E08 Bookings, E09 Payments, E10 Cancellations & Reschedules, E12 Onboarding & Referrals | The canonical customer loop. |
| 3 | E13 Events, E14 Packages & Bundles, E15 Staff & Roles, E16 Settings/Policies/FAQs, E17 Payment Accounts, E18 Reports & Dashboard | Admin operations with contracts already in place. |
| 4 | E19 Marketing Insights, E20 Class-change Requests, E21 Coach Students | Gap-heavy: schema and handlers first. |
| 5 | E03 No more mocks | Delete what is left. |

---

## WIRE-E00 — Hosted database catch-up

**Goal:** make `xydundrayuusqizssgby` match the Prisma schema so any handler can run against it.

**Current state (queried 2026-10-02):** Supabase ledger has 12 migrations; Prisma ledger has 2 (`inf003`, `inf004`). 13 Prisma migrations are unapplied: `be020_022_rls_storage_reporting`, `be050_054_admin_contracts`, `be055_056_staff_coach_and_payment_qr`, `be058_create_session_bundles`, `be289_298_expand_role_permissions`, `be289_298_permission_helpers_rls`, `be289_293_report_sensitive_fields`, `be319_create_session_events`, `venues_on_sessions`, `expand_front_desk_access`, `be344_create_avatars_bucket`, `be344_extend_profile_identity`, `be345_create_public_read_functions`. Missing on hosted: tables `venues`, `session_events`, `faqs`, `pending_uploads`, `payment_qr_codes`, six `bundle*` tables, `permission_definitions`, `staff_role_definitions`, `staff_role_permissions`, `profile_onboarding`, `profile_class_interests`; views `coaches_public`, `session_roster_metrics`, `payment_qr_codes_public`; functions `create_reservation`, `submit_cancellation_request`, `submit_reschedule_request`, `evaluate_waitlist_promotion`, `expire_held_bookings`, `handle_new_user`; schema `app_public`; column `sessions.venueId`; `profiles` identity columns (only `avatarKey` exists). BE-023 seed never ran (0 sessions, 0 policy documents).

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0001 Reconcile the two ledgers | BE | For the 10 migrations applied through Supabase but absent from `_prisma_migrations`, run `prisma migrate resolve --applied <name>` against the hosted project. Document the mapping (`be017_018_capacity_jobs_core` + `audit_and_transitions` = Prisma `be017_018_capacity_jobs_and_rules`). |
| WIRE-0002 Review each pending migration against the live schema | BE | Per `docs/backend/class-catalogue.md`: inspect the 13 pending SQL files for conflicts with what the standalone `profile_avatar_storage` / `profiles_self_policies` slices already created (`avatars` bucket, `profiles.avatarKey`, the three `profiles_self_*` policies). Confirm `be344` is idempotent against them. |
| WIRE-0003 Deploy pending migrations | BE | `prisma migrate deploy` on hosted. Verify with `list_migrations`, `list_tables`, and the function/view checks from the cross-check. Confirm the `on_auth_user_created` trigger now exists and `handle_new_user` fires on a test sign-up. |
| WIRE-0004 Run the BE-023 baseline seed | BE | `BALANSE_ALLOW_DB_SEED=1 BALANSE_ALLOW_SHARED_PROJECT_SEED=1 pnpm --filter @balanse/db db:seed`. Reconcile the 9 imported classes / 11 imported coaches with the seed's ids before running (see WIRE-0501, WIRE-0601). |
| WIRE-0005 Scheduled jobs on hosted | BE | Confirm BE-018 jobs (`expire_held_bookings`, waitlist promotion, `reap_pending_uploads`) are scheduled on the hosted project (pg_cron or equivalent) or document the manual trigger. Holds never expire otherwise. |
| WIRE-0006 RLS advisory | BE | Decide on `ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;` (Supabase critical advisory; table is anon-readable today). Owner's call; record the decision in `docs/backend/supabase-project.md`. |
| WIRE-0007 Docs | BE | Update `docs/backend/migrations.md`, `seed.md`, `auth.md` ("no trigger on hosted" paragraph), `uploads.md` (avatar handler note is stale), `class-catalogue.md` migration-status section. |

**Depends on:** nothing. **Blocks:** every other epic.

---

## WIRE-E01 — Shared API client and web React Query setup

**Goal:** one typed way to call `/api/*` from both apps, on the server and in the browser.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0101 `@balanse/api-client` package | FE | `packages/api-client` with `apiFetch` (base URL, `Authorization: Bearer`, JSON, `ApiError` with `code`/`status`/`fieldErrors`), a server variant that calls `dispatch()` in-process with the request's access token, and a browser variant that reads the token from the Supabase client. No entity functions yet. |
| WIRE-0102 Error and validation mapping | FE | Map 401 → sign-in redirect, 403 → forbidden state, 409 conflict codes (`EVENT_CONFLICT_CODES`, `target_session_full`, `event_session_taken`…) → toast copy, 422 `ValidationFailedBody` → `applyFieldErrors(form, body)` for React Hook Form. Reuse `toast-copy.ts` / `adminToastCopy`. |
| WIRE-0103 Pagination helpers | FE | `CursorPage` → `useInfiniteQuery` adapter (`items`, `nextCursor`, `totalCount`) for admin queues; `page/pageSize/total` helper for customers and sessions lists; the required `from`/`to` window helper for public sessions and reports (≤ 366 days). |
| WIRE-0104 HTTP types in `@balanse/domain` | FE+BE | Add `http.ts` with request/response types per handler presenter (`presentBooking`, `presentEntitlement`, `presentAcquisition`, roster payload, settings payload, customer list/detail). Keep `AdminEvent*` where they are. |
| WIRE-0105 Web React Query layer | FE | `apps/web/src/lib/query/{client,keys}.ts`, `prefetch.tsx` (server prefetch + `HydrationBoundary`, same shape as admin's `prefetchAdmin`), keys rooted at `["web", customerId ?? "guest"]`. Document in `docs/ways-of-working.md` (`lib/` row) and a `lib/query/README.md`. |
| WIRE-0106 Admin query layer split | FE | Split `lib/query/queries.ts` and `mutations.ts` into `lib/query/<entity>.ts` modules behind the same exports so later epics land one file each. Replace `adminAuthScope(principal)` with a session-derived scope (WIRE-E02). |
| WIRE-0107 Field-name and money mapping | FE | Centralise the `*Php` ↔ `php_decimal` and field-rename mapping in the client so forms keep today's names until a later cleanup. |

**Depends on:** E00 for anything end-to-end. **Blocks:** every entity epic.

---

## WIRE-E02 — Admin Supabase Auth and API mount

**Goal:** the admin app signs in a real staff member and can call `/api/admin/*`.

**Current state:** `apps/admin` has no `@supabase/*` dependency and no `/api` route; `middleware.ts`, `app/layout.tsx`, `Providers.tsx`, `lib/query/auth-scope.ts`, `lib/authorization/admin-access.ts`, `AdminGuard`, `AdminShell`, `AdminLogin`, and ~50 screens read the mock principal cookie (`balanse-mock-principal`). Every `/api/admin/*` route requires a Bearer token resolving to an active `staff_members` row (`packages/api/src/auth.ts`). `docs/engineering/mock-harness-removal.md` says web steps 2–3 are done and admin is unchanged.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0201 Admin Supabase session | FE | Port `modules/session/{supabase-config,supabase-server,SessionProvider}.ts` from web; `proxy.ts`-style middleware that refreshes the cookie and sends guests to `/login`. Email/password only (`docs/backend/auth.md`: Google is sign-in only for provisioned staff). |
| WIRE-0202 Staff actor from the session | FE+BE | Resolve the signed-in user to a `StaffAuthorizationActor` (staff id, role, permissions, `coachId`) via a small `GET /api/admin/me` handler (new route; mirrors `resolveActor`) so `useAdminAccess`, `AdminGuard`, `visibleAdminNavItems`, and `adminAuthScope` read real data. Replace `MockPrincipal` types in `admin-access.ts` and `Providers.tsx`. |
| WIRE-0203 Admin login screen | FE | `AdminLogin` on React Hook Form + zod calling a `signInWithPassword` server action (same as web's `login-actions.ts`). Remove identity switcher and `useSwitchAuthorizedIdentity`. |
| WIRE-0204 Mount the API in admin | FE+BE | `apps/admin/src/app/api/[[...path]]/route.ts` calling `dispatch` (same as web), so admin calls stay same-origin. Add `@balanse/api` env (`SUPABASE_SERVICE_ROLE_KEY` server-only, never `NEXT_PUBLIC_*`). |
| WIRE-0205 Query scope from session | FE | `adminAuthScope` = `${staffId}:${roleId}:${permissionsHash}` from WIRE-0202; clear the cache on sign-out. |
| WIRE-0206 First administrator | BE | Provision the owner's staff account per `auth.md` §Admin provisioning (Dashboard → Users, then `staff_members` row with `role_super_admin`). Document; do not invent an account. |
| WIRE-0207 Remove admin harness | FE | Delete `modules/dev-harness/MockSessionHarness.tsx`, `MockSessionProvider.tsx`, `balanse-mock-principal` reads, `NEXT_PUBLIC_ENABLE_MOCK_HARNESS` from admin; keep the Storybook principal decorator until E03. |

**Depends on:** E00 (`staff_role_definitions` must exist on hosted). **Blocks:** all admin entity epics.

---

## WIRE-E04 — Sessions and Schedule

**Scope:** public calendar and session reads, public session page and roster, admin schedule CRUD, duplicate/recurrence, cancel, roster and attendance.

**Screens / forms:** web `/`, `/book/quick`, `/book/calendar`, `/portal/schedule` (`ScheduleCalendarSection`, `load-schedule.ts`), `/sessions/[classSlug]/[date]/[sessionId]` (+ OG image, poster route, share kit); admin `/schedule`, `/schedule/new`, `/schedule/[sessionId]` (`SessionFormPage` + `forms/session/session-form.schema.ts`), `/schedule/duplicate` (`DuplicateScheduleForm`), `/schedule/[sessionId]/recurrence` (`RecurringScheduleForm`), `/sessions/[sessionId]/roster` (`RosterPage`).

**Adapter methods retired:** `getPublicSessions`, `getPublicSession`, `getPublicSessionPage`, `getPublicRoster`, `getAdminSessions`, `upsertAdminSession`, `duplicateAdminSchedule`, `createAdminRecurringSchedule`, `cancelAdminSession`, `getAdminSessionRoster`, `checkIn`, `markNoShow`.

**Backend state:** `GET /api/public/sessions` (requires `from`/`to`), `GET /api/public/sessions/{id}` (thin DTO), `GET/POST /api/admin/sessions`, `PATCH /api/admin/sessions/{id}`, `POST .../cancel`, `POST /api/admin/sessions/duplicate`, `POST .../{id}/recurrence`, `GET .../{id}/roster`, `POST .../check-in`, `POST .../no-show` exist. Gaps: no `name` / `bookable` columns; thin public session DTO; no roster route; roster DTO has no identity map.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0401 Schema: `sessions.name`, `sessions.bookable` | BE | Nullable `name` (occurrence title, ≤ 120), `bookable` boolean default true. Update `app_public.public_session` to return `name` as `occurrence_title`. Prisma + migration. |
| WIRE-0402 Handler: session create/patch accept `name`, `bookable`; list filters | BE | `postAdminSession` / `patchAdminSession` read both; `GET /api/admin/sessions` filters by `from`/`to`, `classId`, `coachId`, `venueId`, `status`; response includes `venue`, `coachAssignments`, `bookable`, `name`. |
| WIRE-0403 Handler: extend `GET /api/public/sessions/{id}` to the page shape | BE | Read through `app_public.public_session`; return `PublicSessionPage` (class slug, short description, hero image, venue name/address, detailed coaches, linked event). Keep 404 for `DRAFT`. Update `api-contracts.md`. |
| WIRE-0404 Handler: `GET /api/public/sessions/{id}/roster` | BE | Call `app_public.public_session_roster` **as the caller** (set the JWT claims on the connection or pass the viewer id) so `auth.uid()` scoping works; mint ~10-minute signed URLs for `avatar_key`; never return the raw key. Shape = `PublicRoster`. |
| WIRE-0405 Handler: roster identity | BE | `GET /api/admin/sessions/{id}/roster` adds `people: Record<customerId, AdminRosterPerson>` (nickname, avatar signed URL, `showOnPublicRoster`, onboarding when `customers.read`), and aligns names with the mock (`waitlisted`, numeric metrics). |
| WIRE-0406 API client: `sessions.ts` | FE | `listPublicSessions({from,to})`, `getPublicSession(id)`, `getPublicRoster(id)`, `listAdminSessions(filters)`, `createSession`, `patchSession`, `cancelSession`, `duplicateSessions`, `createRecurrence`, `getRoster`, `checkIn`, `markNoShow`. Money/field mapping per E01. |
| WIRE-0407 Hooks (web) | FE | `publicSessionsQuery(range)`, `publicSessionQuery(id)`, `publicRosterQuery(id)`; `ScheduleCalendarSection` reads sessions via hook and bookings via E08's hook; server loaders use the server client. |
| WIRE-0408 Hooks (admin) | FE | `lib/query/sessions.ts`: `adminSessionsQuery`, `adminSessionRosterQuery`, `useUpsertAdminSession`, `useCancelAdminSession`, `useDuplicateAdminSchedule`, `useCreateAdminRecurringSchedule`, `useCheckIn`, `useMarkNoShow`. Keep the invalidation map from `lib/query/README.md`. |
| WIRE-0409 Forms | FE | `session-form.schema.ts`, `DuplicateScheduleForm.schema.ts`, `RecurringScheduleForm.schema.ts` submit through the hooks; 422 paths `inactive_reference`, `venue_not_found`, window errors surface on the right fields. |
| WIRE-0410 Public session page + share | FE | `PublicSessionPage`, OG image, poster route, `share-card.tsx`, `public-page.ts`, `public-return-label.ts` read via the server client. Remove `getMockAdapter` from these files. |
| WIRE-0411 Roster page | FE | `RosterPage` + `sessions/[sessionId]/roster/page.tsx` read the roster query; the coach-scope guard uses the actor's `coachId` instead of `getAdminSessions()`. |
| WIRE-0412 Seeder | BE | `seed/sessions.ts`: the 12 showcase sessions from `fixtures.ts` (`session-past-open` … `session-event-capoeira`) plus the 3 event sessions, with `name`, venue, coaches, capacity, on the fixture's fixed September–October 2026 dates (decision 8: no relative-date mode). Depends on E05–E07 ids. |
| WIRE-0413 Remove mocks | FE | Remove every runtime caller of the 12 adapter methods and of the `publicSessions` / `adminSessions` fixtures; they stay in `@balanse/mock` for Storybook. |

**Depends on:** E00, E01, E02 (admin parts), E05, E06, E07 (ids and venue column). **Source docs:** `docs/screen-specs/customer/07-schedule.md`, `admin/05-schedule-management.md`, `admin/12-session-roster-check-in.md`, `public/12-session-page.md`, `openspec/specs/recurring-schedules.md`.

---

## WIRE-E05 — Classes

**Scope:** public class list and detail, admin class list and editor.

**Current state:** already **live** through the database RPC (`readClassCatalogue` / `writeClassCatalogue` in `@balanse/api/class-catalogue`, server actions in `apps/admin/src/lib/class-catalogue-actions.ts`, cookie-based admin sign-in). `GET /api/public/classes` and `POST/PATCH /api/admin/classes` exist but carry only `name, shortDescription, defaultDurationMinutes, defaultCustomerPrice, active`; they cannot write slug, redirect URL, description, images, or marketing coaches. `ClassCatalogueProvider` falls back to the mock when `NEXT_PUBLIC_CLASS_CATALOGUE_MODE` is not `database`.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0501 Extend the class routes to the full catalogue shape | BE | Extend `POST/PATCH /api/admin/classes` to the full `PublicClass` shape (slug, `customPageUrl`, `description`, `heroImage`, `galleryImages`, `coachIds`) and have them call the same SECURITY INVOKER RPC as `writeClassCatalogue`. `saveClassCatalogue` routes through them, so E02's staff auth replaces the separate catalogue cookie (decision 7). |
| WIRE-0502 Handler: full class DTO on `GET /api/public/classes` and `/api/admin/classes` | BE | Return slug, description, images, `coachIds` (from `class_marketing_coaches`). |
| WIRE-0503 API client: `classes.ts` | FE | `listPublicClasses`, `listAdminClasses`, `createClass`, `patchClass`. |
| WIRE-0504 Hooks | FE | web: `publicClassesQuery` for `ClassesPage`, `ClassDetailPage`, calendar filters, onboarding interests; admin: `adminClassesQuery`, `useUpsertAdminClass`. |
| WIRE-0505 Forms | FE | `class-form.schema.ts` + `ClassFormPage.schema.ts` submit through the hook; `ClassImagesInput` stays on bundled asset paths (storage serving is WIRE-012). Remove `ClassDatabaseAccess` connect/disconnect once E02 auth is in. |
| WIRE-0506 Seeder reconciliation | BE | Hosted already has 9 classes from the catalogue import; `seed.ts` upserts 13 with ids `class_*`. Align ids (prefer the imported rows), keep `isPlaceholder`, add the four missing classes (`Contemporary`, `Groove`, `Femme`, `Kids Classes`) as drafts. |
| WIRE-0507 Remove mocks | FE | Remove every runtime caller of `getPublicClasses`, `getAdminClasses`, `upsertAdminClass`; drop the mock branch in `ClassCatalogueProvider` and `apps/web/src/lib/class-catalogue.ts`. Fixtures stay for Storybook. |

**Depends on:** E00, E01, E02. **Source docs:** `public/10-class-pages.md`, `admin/06-class-management.md`, `docs/backend/class-catalogue.md`.

---

## WIRE-E06 — Coaches

**Scope:** public coach list (home, about, coaches page, class pages), admin coach CRUD, coach photo upload.

**Backend state:** `GET /api/public/coaches` (reads `coaches_public`), `GET/POST /api/admin/coaches`, `PATCH .../{id}`, `POST/DELETE .../{id}/photo` (BE-052 mint/confirm) exist. `CoachPhotoField` uses `ImageUpload` (mock).

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0601 Seeder reconciliation | BE | Hosted has 11 placeholder coaches (`coach_*`); fixtures use `coach-*` with rates 650–700 and `photoKey` slugs. Keep hosted ids and the placeholder rate 500 (decision 9: Rex corrects rates in the admin later); set `photoKey` from the asset manifest slugs. |
| WIRE-0602 API client: `coaches.ts` | FE | `listPublicCoaches`, `listAdminCoaches`, `createCoach`, `patchCoach`, `mintCoachPhoto`, `confirmCoachPhoto`, `removeCoachPhoto`. Rates are stripped server-side for actors without `coaches.rates.read`; the client types `defaultRatePhp` as optional. |
| WIRE-0603 Hooks | FE | web: `publicCoachesQuery`; admin: `adminCoachesQuery`, `useUpsertAdminCoach`, `useReplaceCoachPhoto`, `useRemoveCoachPhoto`. |
| WIRE-0604 Form + real upload | FE | `coach-form.schema.ts` submits through the hook. `ImageBinding` for `CoachPhotoField` performs mint → `PUT` → confirm and only then `setValue("photoKey")`; failure leaves no dangling key. |
| WIRE-0605 Remove mocks | FE | Remove every runtime caller of `getPublicCoaches`, `getAdminCoaches`, `upsertAdminCoach`; home/about/coaches pages read via the server client. Fixtures stay for Storybook. |

**Depends on:** E00, E01, E02. **Source docs:** `public/05-coaches.md`, `admin/07-coach-management.md`, `docs/backend/uploads.md`.

---

## WIRE-E07 — Venues

**Backend state:** `GET/POST /api/admin/venues`, `PATCH .../{id}` exist; no delete (deactivate). Model lacks `openingHours`, `studioOwned`. Table missing on hosted until E00.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0701 Schema: `venues.openingHours`, `venues.studioOwned` | BE | Text default `""`, boolean nullable. `presentAdminVenue` returns both; `POST`/`PATCH` accept both. |
| WIRE-0702 API client: `venues.ts` | FE | `listVenues({active,kind})`, `createVenue`, `patchVenue`. |
| WIRE-0703 Hooks | FE | `adminVenuesQuery`, `useUpsertAdminVenue` (invalidates `venues.all`, `sessions.all`). |
| WIRE-0704 Form | FE | `VenueFormPage.schema.ts` submits through the hook; 409 duplicate-name conflict maps to the `name` field. |
| WIRE-0705 Seeder | BE | `seed/venues.ts`: the 4 venues from `venue-fixtures.ts` (`venue-main-studio` already exists in `seed.ts`; add Mandani Bay, Mactan placeholder, inactive IT Park pop-up). |
| WIRE-0706 Remove mocks | FE | Remove every runtime caller of `getAdminVenues`, `upsertAdminVenue`; `venueFixtures` stays for Storybook. |

**Depends on:** E00, E01, E02. **Source docs:** `admin/21-venue-management.md`, `openspec/specs/venues.md`, `docs/backend/venues.md`.

---

## WIRE-E08 — Bookings

**Scope:** customer reservation and waitlist, My Bookings, booking detail, admin booking list/detail, confirm/reject.

**Screens / forms:** web `/portal/book/[sessionId]` (`BookingForm`, client component, no RHF today), `/portal/bookings`, `/portal/bookings/[bookingId]`, calendar booking markers; admin `/bookings`, `/bookings/[bookingId]` (`BookingPages`, 6 direct adapter calls).

**Adapter methods retired:** `createBooking`, `getBookings`, `getBooking`, `joinWaitlist` (dormant), `getAdminBookings`, `confirmAdminBooking`, `rejectAdminBooking`, `expireHeldBooking`, `promoteWaitlistedBooking` (dormant).

**Backend state:** `POST /api/bookings` (returns `kind: hold | waitlist`, accepts `policyVersionIds`, `entitlementId`, `intendedEntitlementId`; SQL rejects the booking unless every `required=true` current policy version is included), `GET /api/bookings`, `GET /api/bookings/{id}`, `POST /api/bookings/{id}/waitlist`, `GET /api/admin/bookings` (`CursorPage`, `tab`/`q`/`classId`/`date`), `POST .../confirm`, `.../reject` exist. Functions missing on hosted until E00.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0801 API client: `bookings.ts` | FE | `createBooking`, `listMyBookings`, `getMyBooking`, `listAdminBookings(cursorQuery)`, `confirmBooking`, `rejectBooking(reason)`. Response envelope `{ kind, waitlistEntryId, booking }` → `CustomerBooking`. |
| WIRE-0802 Hooks (web) | FE | `myBookingsQuery(customerId)`, `myBookingQuery(id)`, `useCreateBooking` (invalidates bookings + the session's public query). Calendar markers read `myBookingsQuery`. |
| WIRE-0803 Hooks (admin) | FE | `adminBookingsInfiniteQuery(filters)`, `adminBookingDetailQuery`, `useConfirmAdminBooking`, `useRejectAdminBooking`; `BookingPages` drops its direct `getMockAdapter()` calls for these and for check-in/no-show (E04) and refunds (E09). |
| WIRE-0804 Booking form on React Hook Form | FE | Extract `booking-form/BookingForm.schema.ts` + `.defaults.ts` (entitlement choice, policy checkboxes, intent). Submit sends `policyVersionIds` from E16's form-policy read; map `missing_required_policy_acceptance`, `session_full`, `cutoff` conflicts to field/form errors. Waitlist intent uses the same `POST /api/bookings`. |
| WIRE-0805 Booking detail and hold countdown | FE | `BookingDetail` reads `holdExpiresAt` from the API; countdown and expiry refetch. |
| WIRE-0806 Seeder | BE | `seed/bookings.ts`: one booking per `BookingStatus` plus the community bookings from `fixtures.ts`, with `bookingReference`, payments/refunds rows consistent with status, acceptances for every required policy version, `holdExpiresAt` in the future for `HELD_*`. Generate placeholder profiles through WIRE-1101 for every synthetic `cust-q-*` customer so the ~120 queue rows seed too (decision 3). Depends on E11's id map. |
| WIRE-0807 Remove mocks | FE | Remove every runtime caller of the 9 adapter methods; `bookings` fixtures stay for Storybook. |

**Depends on:** E00, E01, E02, E04, E11, E14 (entitlements on the form), E16 (form policies). **Source docs:** `customer/08-booking-form.md`, `customer/11-booking-detail.md`, `customer/15-my-bookings.md`, `admin/08-booking-management.md`, `business-requirements/06-booking-rules.md`, `09-reservation-lifecycle.md`, `10-capacity-and-waitlist.md`.

---

## WIRE-E09 — Payments and Refunds

**Scope:** payment method selection, GCash proof upload, payment instructions, admin payment queue, record cash, refund states, proof signed URL.

**Screens / forms:** web `/portal/bookings/[bookingId]/payment` (`PaymentMethodPage`), `/payment/gcash` (`GcashProofPage` + web `ImageUpload` mock); admin `/payments` (`PaymentPages`), refund actions in `BookingPages`.

**Adapter methods retired:** `setPaymentMethod`, `uploadPaymentProof`, `getPaymentInstructions`, `getAdminPayments`, `recordCash`, `markRefundPending`, `markRefunded`, `getAdminPaymentProofSignedUrl`.

**Backend state:** `POST /api/bookings/{id}/payment-method`, `POST /api/bookings/{id}/payment-proof` (mint without `objectKey`, confirm with it; jpeg/png/webp/heic, 5 MiB), `GET /api/payment-instructions` (single GCash account), `GET /api/admin/payments` (`CursorPage`, `tab`), `GET /api/admin/payment-proofs/{id}/signed-url`, `POST /api/admin/payments/{id}/record-cash`, `POST /api/admin/refunds/{id}/mark-pending`, `.../mark-refunded` exist.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0901 Handler: multi-account payment instructions | BE | `GET /api/payment-instructions` returns `accounts[]` (from E17's `payment_qr_codes` with type/name/number) plus the legacy fields; `qrImageKey` resolved to a public URL. |
| WIRE-0902 API client: `payments.ts` | FE | `setPaymentMethod`, `mintPaymentProof`, `confirmPaymentProof`, `getPaymentInstructions`, `listAdminPayments(cursor, tab)`, `getProofSignedUrl`, `recordCash`, `markRefundPending`, `markRefunded`. |
| WIRE-0903 Hooks | FE | web: `paymentInstructionsQuery`, `useSetPaymentMethod`, `useSubmitPaymentProof` (mint → `PUT` → confirm as one mutation with progress); admin: `adminPaymentsInfiniteQuery(tab, search)`, `adminPaymentProofUrlQuery`, `useRecordCash`, `useMarkRefundPending`, `useMarkRefunded`. |
| WIRE-0904 Forms | FE | `PaymentMethodPage` choice on React Hook Form (`payment-method-form/`); `GcashProofPage` on React Hook Form with the real file input, `payment_proof` policy checkboxes (E16), and `PROOF_REUPLOAD_POLICY` copy. Replace `apps/web/src/components/balanse/ImageUpload.tsx` mock behaviour. |
| WIRE-0905 Seeder | BE | Payments and refunds rows are created inside WIRE-0806 per booking status; this task adds proof objects: upload one placeholder image to `payment-proofs/<bookingId>/` for `PAYMENT_SUBMITTED` bookings so the admin signed-URL path works. |
| WIRE-0906 Remove mocks | FE | Remove every runtime caller of the 8 adapter methods, `paymentInstructions`, and `MOCK_PROOF_PREVIEW_URL`; they stay for Storybook. |

**Depends on:** E08, E17 (accounts). **Source docs:** `customer/09-payment-method.md`, `customer/10-gcash-proof-upload.md`, `admin/09-payment-review.md`, `business-requirements/08-payment-rules.md`, `11-cancellations-and-refunds.md`.

---

## WIRE-E10 — Cancellations and Reschedules

**Screens / forms:** web `/portal/bookings/[bookingId]/cancel` (`CancellationRequest` + `CancellationForm.schema.ts`, already React Hook Form), `/reschedule` (`RescheduleRequest`, client component, no RHF); admin `/cancellations`, `/reschedules` (infinite queues).

**Adapter methods retired:** `createCancellationRequest`, `createRescheduleRequest`, `getAdminCancellationRequests`, `completeAdminCancellation`, `rejectAdminCancellation`, `getAdminRescheduleRequests`, `approveAdminReschedule`, `rejectAdminReschedule`.

**Backend state:** `POST /api/bookings/{id}/cancellation-request`, `POST /api/bookings/{id}/reschedule-request`, `GET /api/admin/cancellation-requests`, `.../complete`, `.../reject`, `GET /api/admin/reschedule-requests`, `.../approve` (re-checks capacity: `target_session_full`), `.../reject` exist. OQ-2 rules deliberately unenforced (documented).

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1001 API client: `requests.ts` | FE | `createCancellationRequest(bookingId, reason)`, `createRescheduleRequest(bookingId, targetSessionId)`, `listCancellations(cursor, q)`, `completeCancellation`, `rejectCancellation(reason)`, `listReschedules(cursor, q)`, `approveReschedule`, `rejectReschedule(reason)`. |
| WIRE-1002 Hooks | FE | web: `useCreateCancellationRequest`, `useCreateRescheduleRequest`; admin: `adminCancellationsInfiniteQuery`, `adminReschedulesInfiniteQuery`, `useCompleteAdminCancellation`, `useRejectAdminCancellation`, `useApproveAdminReschedule`, `useRejectAdminReschedule`. |
| WIRE-1003 Forms | FE | `CancellationForm` submits through the hook with `cancellation` policy checkboxes (E16). `RescheduleRequest` becomes `reschedule-form/` on React Hook Form: target session picker from `publicSessionsQuery`, `reschedule` policies; `target_session_full` and `cutoff` map to form errors. |
| WIRE-1004 Seeder | BE | Request rows are created inside WIRE-0806 for `CANCELLATION_REQUESTED` / `RESCHEDULE_REQUESTED` bookings; this task adds resolved history rows (completed, rejected, approved) so admin history tabs have data. |
| WIRE-1005 Remove mocks | FE | Remove every runtime caller of the 8 adapter methods; they stay for Storybook. |

**Depends on:** E08. **Source docs:** `customer/12-cancellation-request.md`, `customer/13-reschedule-request.md`, `admin/10-cancellation-requests.md`, `admin/11-reschedule-requests.md`, `business-requirements/11`, `12`.

---

## WIRE-E11 — Customers and Profile

**Scope:** customer identity, basic profile, avatar, roster visibility, policy history; admin customer directory and detail.

**Current state:** customer login, sign-up, profile fields, and avatar are **already live** in `apps/web` through server-side Supabase (`modules/session/current-customer.ts`, `avatar-storage.ts`, `customer-self-service-actions.ts`), bypassing `/api`. On hosted, `profiles` has only `fullName`, `email`, `contactNumber`, `avatarKey`, so nickname, roster visibility, and onboarding timestamps are dropped until E00 deploys `be344`. `GET/PATCH /api/me` carry `fullName`/`contactNumber` only. Admin `GET /api/admin/customers` supports `q` only and returns `{id,name,contact,upcoming,lastVisit}`; detail lacks onboarding, referral, nickname, avatar.

**Adapter methods retired:** `getMe`, `patchMe`, `setMyAvatar` (dormant), `ensureCustomer`, `createCustomer` (dormant), `getMePolicyAcceptances`, `getAdminCustomers`, `getAdminCustomer`, `getAdminCustomerEntitlements` (dormant).

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1101 Seed scaffolding: auth users and id map | BE | `prisma/seed/auth.ts`: create demo `auth.users` with the Supabase Admin API (service role, server-side, explicit flag), write the `profiles` row (first/last, nickname, `showOnPublicRoster`, `referralCode`, timestamps), and record `mockId → uuid` in `seed/ids.ts`. Used by E08, E12, E14, E15. Never a real photo in `avatars`. |
| WIRE-1102 Handler: `GET/PATCH /api/me` identity extension | BE | `getMe` returns `CustomerProfile` (first/last, nickname, signed `avatarUrl`, `showOnPublicRoster`, `referralCode`, `onboardingStatus`, `referralChannel`); `patchMe` accepts `firstName`, `lastName`, `nickname`, `contactNumber`, `showOnPublicRoster`. `customer-self-service-actions.ts` switches from `saveProfileFields` to `PATCH /api/me` so one validation path exists; `saveProfileFields` is removed (decision 5). |
| WIRE-1103 Handler: `POST/DELETE /api/me/avatar` | BE | BE-052 lifecycle: `POST` without `objectKey` mints a signed upload into `avatars/<profileId>/<cuid>.webp` (`pending_uploads.purpose = profile_avatar`, `profileId` actor); `POST` with `objectKey` confirms, sets `profiles.avatarKey`, deletes the previous object; `DELETE` clears it. `GET /api/me` returns a ~10-minute signed `avatarUrl`. `apps/web/src/modules/session/avatar-storage.ts` is replaced by the client calls; update `docs/backend/uploads.md` (decision 6). |
| WIRE-1104 Handler: customer directory filters and identity | BE | `GET /api/admin/customers` adds `hasUpcoming`, `onboardingStatus`, nickname search, and returns `AdminCustomer` (profile identity + counts). `GET /api/admin/customers/{id}` adds `onboarding` (gated by `customers.read`), `referral` summary (`referredBy`, `channel`, `referrals`), nickname, avatar URL. |
| WIRE-1105 API client: `customers.ts` | FE | `getMe`, `patchMe`, `listMyPolicyAcceptances`, `listAdminCustomers(filters, page)`, `getAdminCustomer(id)`. |
| WIRE-1106 Hooks | FE | web: `meQuery`, `usePatchMe`, `myPolicyAcceptancesQuery`; admin: `adminCustomersQuery(filters)`, `adminCustomerDetailQuery`. Portal pages switch from `getCurrentCustomer()` + mock mirror to `meQuery` on the server client; `ensureCustomer` mirror removed. |
| WIRE-1107 Forms | FE | `BasicProfileForm.schema.ts` submits through `usePatchMe`; `RosterVisibilitySetting` likewise; `AvatarUploader` submits through `useSetMyAvatar` (mint → `PUT` → confirm, or remove). |
| WIRE-1108 Seeder | BE | `seed/customers.ts`: the 15 customers from `community-fixtures.ts` through WIRE-1101, plus placeholder WEBP avatars uploaded to `avatars/<uuid>/` for the members with `avatar` set (the SVG site paths cannot be stored). |
| WIRE-1109 Remove mocks | FE | Remove every runtime caller of the 9 adapter methods and the customer fixtures (`ensureCustomer` mirror included); `mock-customer-self-service.ts` stays as the Storybook stand-in. |

**Depends on:** E00, E01, E02 (admin parts). **Source docs:** `customer/02-sign-up.md`, `customer/05-profile.md`, `admin/04-customer-management.md`, `business-requirements/04-auth-and-profile.md`, `docs/backend/auth.md`, `openspec/changes/public-share-and-profile/`.

---

## WIRE-E12 — Onboarding and Referrals

**Scope:** `/portal/welcome` wizard, portal-home nudge, Profile → About You, referral channel prefill.

**Current state:** schema exists (`profile_onboarding`, `profile_class_interests`, enums, RLS owner CRUD; missing on hosted until E00). Completion/skip timestamps are already written to `profiles` by `saveProfileFields`; answers are mock-only. No HTTP routes. Wizard steps are React Hook Form already (`OnboardingStep{You,Goals,Interests,HeardFrom}.schema.ts`).

**Adapter methods retired:** `getMyOnboarding`, `saveMyOnboarding`, `completeOnboarding`, `skipOnboarding`, `getMyReferralChannel`.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1201 Handlers: `GET/PATCH /api/me/onboarding`, `POST /api/me/onboarding/complete`, `POST .../skip` | BE | Owner-only. `PATCH` upserts `profile_onboarding` + replaces `profile_class_interests`; `*Other` ≤ 120; complete/skip set the `profiles` timestamps. Referral channel folds into `GET /api/me` (WIRE-1102). Add to `routes.ts`, OpenAPI, `api-routes.md`. |
| WIRE-1202 API client: `onboarding.ts` | FE | `getMyOnboarding`, `saveMyOnboarding(patch)`, `completeOnboarding`, `skipOnboarding`. |
| WIRE-1203 Hooks | FE | `myOnboardingQuery`, `useSaveMyOnboarding`, `useCompleteOnboarding`, `useSkipOnboarding`; invalidate `meQuery` on complete/skip. |
| WIRE-1204 Forms | FE | The four step forms and `/portal/profile/about` submit through the hooks; `customer-self-service-actions.ts` onboarding actions are removed. |
| WIRE-1205 Seeder | BE | `seed/onboarding.ts`: `onboardingFixtures` (13 customers), `referralFixtures` (5, in dependency order `cust-ben → cust-m-01 → cust-m-05 / cust-m-08`), `signupDates` as `profiles.createdAt`. Depends on WIRE-1101. |
| WIRE-1206 Remove mocks | FE | Remove every runtime caller of the 5 adapter methods; `onboardingFixtures`, `referralFixtures`, `signupDates` stay for Storybook. |

**Depends on:** E00, E01, E11. **Source docs:** `customer/16-onboarding.md`, `customer/04-portal-home.md`, `openspec/changes/public-share-and-profile/tasks.md` (#352).

---

## WIRE-E13 — Events

**Scope:** admin event list/detail/authoring/status, event session picker, public event page (+ OG image, poster route).

**Backend state:** `GET/POST /api/admin/events`, `GET/PATCH .../{id}`, `.../publish|cancel|archive` exist and accept every mock field; list filters `status`, `sessionId`, `from`/`to` (no `search`). No public event route; `app_public.public_event` exists after E00. `EventFormPage` uses the mock `ImageUpload` for poster/gallery but **no upload route exists for event images** (`posterImage` is documented as a signed-upload object key).

**Adapter methods retired:** `getAdminEvents`, `getAdminEvent`, `getAdminEventForSession`, `createAdminEvent`, `updateAdminEvent`, `publishAdminEvent`, `cancelAdminEvent`, `archiveAdminEvent`, `getPublicEventPage`.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1301 Handler: `GET /api/public/events/{id}` | BE | Read `app_public.public_event`; return `PublicEventPage` (event copy + nested `PublicSessionPage`); 404 for `DRAFT`/`ARCHIVED`; never `internalNotes`. Add to `routes.ts`, OpenAPI, `api-contracts.md`. |
| WIRE-1302 Handler: event image upload | BE | `POST /api/admin/events/{id}/images` mint/confirm (bucket `marketing-assets`, key `marketing-assets/events/<eventId>/<uuid>.<ext>`) for poster and gallery (≤ 12), BE-052 lifecycle (decision 4). Seeded rows keep site paths, so readers accept both object keys and site paths. |
| WIRE-1303 Handler: `search` filter on `GET /api/admin/events` | BE | Title/summary `ILIKE`. |
| WIRE-1304 API client: `events.ts` | FE | `listAdminEvents(filters)`, `getAdminEvent`, `getEventForSession(sessionId)` (= list with `sessionId`), `createEvent`, `patchEvent`, `publishEvent`, `cancelEvent`, `archiveEvent`, `getPublicEvent(id)`, image mint/confirm. |
| WIRE-1305 Hooks | FE | admin: `adminEventsQuery`, `adminEventDetailQuery`, `adminEventForSessionQuery`, `useCreateAdminEvent`, `useUpdateAdminEvent`, `usePublishAdminEvent`, `useCancelAdminEvent`, `useArchiveAdminEvent`; web: server client for the public page. |
| WIRE-1306 Form | FE | `EventFormPage.schema.ts` submits through the hooks; `ImageBinding` performs the real upload; 409 codes from `EVENT_CONFLICT_CODES` map to toasts; 422 `read_only` fields are disabled in the form. |
| WIRE-1307 Public event page + share | FE | `PublicEventPage`, OG image, poster route, `public-return-label.ts` read `getPublicEvent` via the server client. |
| WIRE-1308 Seeder | BE | `seed/events.ts`: the 3 events from `event-fixtures.ts` (published, draft, cancelled) on their 3 sessions (E04). `isPlaceholder=true`. |
| WIRE-1309 Remove mocks | FE | Remove every runtime caller of the 9 adapter methods; `eventFixtures`, `eventFixtureSessions`, `event-engine.ts` stay for Storybook. |

**Depends on:** E04, E07 (venues), E00, E01, E02. **Source docs:** `admin/18-event-management.md`, `public/13-event-page.md`, `openspec/specs/events.md`, `docs/backend/session-events.md`.

---

## WIRE-E14 — Packages and Bundles

**Scope:** public package catalogue/detail, free claim, paid request, acquisition payment, owned packages and redemptions, eligible entitlements on booking; admin bundle CRUD/status/metrics, grant/revoke, acquisition review.

**Backend state:** all BE-058 routes exist (`/api/public/packages`, `/api/me/packages*`, `/api/packages/{id}/claim|acquisitions`, `/api/packages/acquisitions/{id}/payment-method|payment-proof`, `/api/sessions/{id}/eligible-packages`, `/api/admin/bundles*`, `/api/admin/customers/{id}/packages*`, `/api/admin/packages/{id}/revoke|redemptions`, `/api/admin/package-acquisitions*`). Gaps: no per-package credit metrics; applicability is `applicabilityMode` (`ALL_ACTIVE_CLASSES | EXPLICIT_CLASSES`) vs mock `allActiveClasses: boolean`. Tables missing on hosted until E00.

**Adapter methods retired:** `getPublicBundles`, `getPublicBundle`, `getMyEntitlements`, `getMyEntitlement`, `getMyAcquisitions`, `getEligibleEntitlements`, `getEntitlementRedemptions`, `claimFreeBundle`, `requestPaidBundle`, `getAdminBundles`, `getAdminBundle` (dormant), `getAdminBundleMetrics`, `upsertAdminBundle`, `setAdminBundleStatus`, `grantCustomerBundle`, `revokeCustomerEntitlement`, `getAdminBundleAcquisitions`, `approveBundleAcquisition`, `rejectBundleAcquisition`, `getBundleAudit` (dormant).

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1401 Handler: bundle credit metrics | BE | `GET /api/admin/bundles` items carry `metrics: BundleCreditMetrics` (`granted`, `held`, `used`, `restored`, `owners`) from the `bundle_redemptions` ledger, or add `GET /api/admin/bundles/metrics`. |
| WIRE-1402 API client: `packages.ts` | FE | Public, customer, and admin functions for every route above; `applicability` ↔ `applicabilityMode` mapping. |
| WIRE-1403 Hooks | FE | web: `publicPackagesQuery`, `publicPackageQuery(slug)`, `myPackagesQuery`, `myEntitlementQuery`, `entitlementRedemptionsQuery`, `eligiblePackagesQuery(sessionId)`, `useClaimPackage`, `useRequestPackage`, `useAcquisitionPaymentMethod`, `useSubmitAcquisitionProof`; admin: `adminBundlesQuery`, `adminBundleAcquisitionsQuery`, `useUpsertAdminBundle`, `useSetAdminBundleStatus`, `useGrantCustomerBundle`, `useRevokeCustomerEntitlement`, `useApproveBundleAcquisition`, `useRejectBundleAcquisition`. |
| WIRE-1404 Forms | FE | `bundle-form.schema.ts`, `GrantPackageForm.schema.ts` submit through hooks. `PackageDetailPage` claim/request becomes `package-request-form/` on React Hook Form with `package_request` policy checkboxes (E16) and an idempotency key. New acquisition-payment screen (method + proof) reuses E09's proof mutation shape. |
| WIRE-1405 Seeder | BE | `seed/bundles.ts`: 3 definitions, then (after WIRE-1101) 4 acquisitions, 3 entitlements, 7 redemptions from `bundle-fixtures.ts`; credits > 0 checks. |
| WIRE-1406 Remove mocks | FE | Remove every runtime caller of the 20 adapter methods; `bundle-fixtures.ts`, `bundle-engine.ts` stay for Storybook. |

**Depends on:** E00, E01, E02, E05 (class ids), E11 (profiles), E16 (policies). **Source docs:** `public/11-packages.md`, `customer/14-packages.md`, `customer/19-packages.md`, `admin/16-bundle-management.md`, `openspec/specs/session-bundles.md`, `docs/backend/session-bundles.md`, epic #301.

---

## WIRE-E15 — Staff and Roles

**Backend state:** `GET/POST /api/admin/staff`, `PATCH .../{id}`, `.../disable`, `POST/DELETE .../{id}/coach`, `POST .../{id}/role`, `GET /api/admin/permissions`, `GET/POST /api/admin/roles`, `GET/PATCH .../{id}`, `.../clone`, `.../archive` exist. Tables missing on hosted until E00. `POST /api/admin/staff` can invite an auth user through `StoragePort.inviteUser`.

**Adapter methods retired:** `getAdminStaff`, `upsertAdminStaff`, `disableAdminStaff`, `getAdminStaffRoles`, `getAdminStaffRole`, `upsertAdminStaffRole`, `archiveAdminStaffRole`.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1501 API client: `staff.ts` | FE | `listStaff`, `createStaff`, `patchStaff`, `disableStaff`, `linkCoach`, `unlinkCoach`, `assignRole`, `listPermissions`, `listRoles`, `getRole`, `createRole`, `patchRole`, `cloneRole`, `archiveRole`. |
| WIRE-1502 Hooks | FE | `adminStaffQuery`, `adminStaffRolesQuery`, `adminStaffRoleQuery`, `adminPermissionsQuery`, `useUpsertAdminStaff` (composes create/patch + coach link/unlink + role assign), `useDisableAdminStaff`, `useUpsertAdminStaffRole`, `useArchiveAdminStaffRole`. Last-Super-Admin 409s map to toasts. |
| WIRE-1503 Forms | FE | `staff-form.schema.ts`, `StaffDetailPage.schema.ts`, `RoleForm.schema.ts` submit through hooks; permission matrix from `adminPermissionsQuery`, not the domain constant. |
| WIRE-1504 Seeder | BE | `seed/staff.ts`: the 3 custom roles from `staff-fixtures.ts` (Community Host, Content Editor, Role Auditor) with their permission keys; the 7 staff members through WIRE-1101's auth helper, `staff-rex` linked to `coach_rex`. Built-in roles already seeded. |
| WIRE-1505 Remove mocks | FE | Remove every runtime caller of the 7 adapter methods and of `staff-fixtures.ts`; authorization moves to the API. `apply-admin-authorization.ts` / `authorize.ts` stay for Storybook's principal simulation. |

**Depends on:** E00, E01, E02. **Source docs:** `admin/03-staff-management.md`, `admin/17-role-management.md`, `openspec/specs/staff-roles-and-permissions.md`, `docs/backend/staff-roles.md`, `staff-coach-unification.md`.

---

## WIRE-E16 — Settings, Policies, and FAQs

**Scope:** business profile, public content (about/contact/FAQ), policy documents and versions, which policies each customer form requires, customer-side policy reads and acceptances, public content for FAQ/About/Contact pages.

**Backend state:** `GET/PATCH /api/admin/settings` (business, payment, content sections), FAQ `POST/PATCH/DELETE/reorder`, `POST .../policies/{id}/promote`, `GET /api/public/content`, `GET /api/me/policy-acceptances` (with `requiredCurrent`) exist. Gaps: no policy document create/edit/delete routes; no per-form requirement storage (`PolicyDocument.required` is global); no public "policies for form X" read; acceptances only on bookings. Public FAQ/About/Contact pages render static domain copy and ignore admin edits.

**Adapter methods retired:** `getAdminSettings`, `updateAdminSettings`, `upsertPolicyDocument`, `deletePolicyDocument`, `deletePolicy`, `setPolicyFormRequirements`, `promotePolicyVersion`, `getCustomerFormPolicies`, `acceptPolicies`, `getPublicContent` (dormant).

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1601 Schema: policy form requirements | BE | `policy_form_requirements(form customer_policy_form, document_id, sort_order)` with `CUSTOMER_POLICY_FORMS` as an enum; RLS admin-write, public-read of current versions. |
| WIRE-1602 Schema: acceptances for non-booking forms | BE | Make `booking_policy_acceptances.bookingId` nullable and add `form` (`customer_policy_form`) + optional `acquisitionId`; keep the no-update/no-delete triggers; adjust `assert_required_acceptances` to only check booking-form requirements (replacing the global `required` rule). |
| WIRE-1603 Handlers: policy document CRUD and form requirements | BE | `POST /api/admin/settings/policies` (create document + first version), `PATCH .../policies/{id}` (title, kind), `POST .../policies/{id}/versions` (new draft version), `DELETE .../policies/{id}` (only when no acceptances), `GET/PUT /api/admin/settings/policy-forms`. Settings GET returns `policyFormRequirements`. |
| WIRE-1604 Handlers: public policy read + acceptance write | BE | `GET /api/public/policy-forms/{form}` → current versions for that form; `POST /api/me/policy-acceptances` `{ form, policyVersionIds, bookingId?, acquisitionId? }`. Booking keeps passing ids on `POST /api/bookings`. |
| WIRE-1605 API client: `settings.ts`, `policies.ts`, `content.ts` | FE | Settings get/patch, FAQ CRUD/reorder, policy CRUD/promote, form requirements get/put, `getFormPolicies(form)`, `acceptPolicies`, `getPublicContent`. |
| WIRE-1606 Hooks | FE | admin: `adminSettingsQuery`, `useUpdateAdminSettings` (per section), FAQ mutations, policy mutations, `useSetPolicyFormRequirements`; web: `formPoliciesQuery(form)` used by sign-up, booking, package, GCash, cancel, reschedule, contact; `useAcceptPolicies`; `publicContentQuery` for FAQ/About/Contact pages. |
| WIRE-1607 Forms | FE | `settings-form.schema.ts` sections (`BusinessProfileSection`, `PublicContentSection`, FAQ editor) submit per section through hooks; `PoliciesSection` editor + `PolicyFormsSection` matrix on hooks. |
| WIRE-1608 Seeder | BE | `seed/settings.ts`: `adminSettings` business/content/FAQ (`FAQ_GROUPS`), the two mock policy documents (`Waiver 2026-01`, `Gym Policy 2026-01`) as placeholder versions, form requirements `{ booking: [Waiver, Gym Policy] }`, `public_settings` in `app_meta`. |
| WIRE-1609 Remove mocks | FE | Remove every runtime caller of the 10 adapter methods; `adminSettings`, `publicContent` fixtures stay for Storybook. |

**Depends on:** E00, E01, E02. **Source docs:** `admin/13-settings.md`, `public/02-about.md`, `public/03-contact.md`, `public/04-faqs.md`, `business-requirements/07-booking-form-and-waivers.md`, `docs/backend/settings-write.md`.

---

## WIRE-E17 — Payment Accounts (QR collection)

**Backend state:** `GET/POST /api/admin/settings/payment-qrs`, `PATCH .../{id}`, `POST .../{id}/activate`, `DELETE .../{id}` (archive) exist; `POST` mints or confirms an image. Model has `label`, `imageKey` (unique, non-null), `isActive`, `archivedAt`, exactly one active. UI has `type` (GCASH/MAYA/QRPH), `accountName`, `accountNumber`, nullable image, several active. Table missing on hosted until E00.

**Adapter methods retired:** `listPaymentQrs`, `upsertPaymentQr`, `setPaymentQrActive`, `archivePaymentQr`.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1701 Schema: account fields | BE | Add `type payment_account_type`, `accountName`, `accountNumber`; make `imageKey` nullable (keep unique when present); several accounts may be active at once (decision 2): replace the one-active constraint with "at least one active while any non-archived row exists". Update `payment_qr_codes_public` (all active rows) and `docs/backend/payment-qr-collection.md`. |
| WIRE-1702 Handler: collection routes accept the new fields; `PATCH` can clear the image | BE | Mint/confirm stays BE-052. `GET /api/payment-instructions` consumes the collection (WIRE-0901). |
| WIRE-1703 API client: `payment-accounts.ts` | FE | `listPaymentAccounts(includeArchived)`, `createPaymentAccount`, `patchPaymentAccount`, `mintAccountImage`, `confirmAccountImage`, `activate`, `archive`. |
| WIRE-1704 Hooks | FE | `adminPaymentQrsQuery`, `useUpsertPaymentQr`, `useSetPaymentQrActive`, `useArchivePaymentQr`. |
| WIRE-1705 Form | FE | `PaymentAccountFormDialog.schema.ts` submits through hooks; `ImageBinding` performs the real mint → `PUT` → confirm. |
| WIRE-1706 Seeder | BE | `seed/payment-accounts.ts`: the 3 accounts from `paymentAccountFixtures` with placeholder QR images uploaded to `marketing-assets/settings/payment-qrs/`. |
| WIRE-1707 Remove mocks | FE | Remove every runtime caller of the 4 adapter methods; `paymentAccountFixtures` stays for Storybook. |

**Depends on:** E00, E01, E02. **Source docs:** `admin/15-payment-qr.md`, `docs/backend/payment-qr-collection.md`.

---

## WIRE-E18 — Reports, Dashboard, Sales, Transactions

**Backend state:** `GET /api/admin/dashboard`, `/dashboard/metrics`, `/reports/sales-overview`, `/class-performance`, `/coach-costs`, `/session-performance` (paginated), `/reports/sessions/{id}` exist; date range required, ≤ 366 days; sensitive fields stripped by permission. Views missing on hosted until E00. Transactions page composes bookings + acquisitions + customers (E08, E14, E11).

**Adapter methods retired:** `getAdminDashboard`, `getAdminReportsSales`, `getAdminReports`, `getAdminSessionReport`.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1801 API client: `reports.ts` | FE | `getDashboard`, `getDashboardMetrics`, `getSalesOverview(range, filters)`, `getClassPerformance`, `getCoachCosts`, `getSessionPerformance(range, page)`, `getSessionReport(id)`. |
| WIRE-1802 Hooks | FE | `adminDashboardQuery` (used by `/dashboard` and `AdminSidebar`), `adminDashboardMetricsQuery`, `adminReportsQuery(filters)` composing the four report calls, `adminSessionReportQuery`, `adminReportsSalesQuery(range)` for `/sales`. |
| WIRE-1803 Forms | FE | `ReportsFilterForm` and the Sales date filter on React Hook Form, enforcing the 366-day cap client-side. |
| WIRE-1804 Transactions page | FE | Reads E08/E14/E11 queries; no new route. |
| WIRE-1805 Remove mocks | FE | Remove every runtime caller of the 4 adapter methods; `dashboard-series.ts` stays for Storybook. |

**Depends on:** E08, E09, E14 (data), E00, E01, E02. **Source docs:** `admin/02-dashboard.md`, `admin/14-sales-inventory-reports.md`, `business-requirements/22-inventory-and-sales-reporting.md`, `docs/backend/reporting.md`, `dashboard-metrics.md`.

---

## WIRE-E19 — Marketing Insights

**Backend state:** no route. Every source column exists after E00 (`profiles.createdAt`, `referralChannel`, `referredById`, `onboardingCompletedAt/SkippedAt`, `profile_onboarding.*`, `profile_class_interests`). Permission `reports.marketing.read` exists in the domain. Screen `/marketing-insights` (`MarketingInsightsPage`, range helper) exists on the mock.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-1901 Handler: `GET /api/admin/marketing-insights?from&to` | BE | Returns `MarketingInsights` (counts only, no ids/names); `heardFromOther` top 20 de-duplicated lowercase; add to `ADMIN_API_ACCESS` under `reports.marketing.read`; add to `routes.ts`, OpenAPI, `api-routes.md`. |
| WIRE-1902 API client + hook | FE | `getMarketingInsights(range)`; `adminMarketingInsightsQuery(range)`. |
| WIRE-1903 Form | FE | Date-range form on React Hook Form (bounds from `marketing-insights-range.ts`). |
| WIRE-1904 Remove mocks | FE | Remove every runtime caller of `getAdminMarketingInsights`; the aggregation in `community-engine.ts` stays for Storybook. |

**Depends on:** E11, E12 (data), E02. **Source docs:** `admin/22-marketing-insights.md` (#354).

---

## WIRE-E20 — Coach Class-change Requests

**Backend state:** no model, no routes. Domain types exist (`ClassChangeRequest`, kinds `RESCHEDULE | SUBSTITUTE | CANCEL`, statuses `PENDING | APPROVED | DENIED | WITHDRAWN`, approval permissions `schedule.update` / `schedule.cancel`). Screens exist on the mock: `/schedule/[sessionId]/change` (`ClassChangeRequestPage` + `class-change-form.schema.ts`), `/schedule/requests` (`ClassChangeQueuePage`, `ClassChangeRequestCard`, `ClassChangeSessionActions`).

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-2001 Schema | BE | `class_change_requests` (session, kind, status, reason, requester staff/coach, proposed window, substitute coach, reviewer, decision note, timestamps), enums, indexes, RLS (coach own rows; reviewers by permission), audit on status change. |
| WIRE-2002 Handlers | BE | `GET /api/admin/class-change-requests` (reviewers all; coach own), `GET /api/admin/sessions/{id}/substitute-coaches`, `POST /api/admin/sessions/{id}/class-change-requests`, `POST .../class-change-requests/{id}/withdraw|approve|deny`. Approve applies the change: reschedule updates the session window and notifies bookings (manual), substitute swaps `session_coaches`, cancel calls the existing session cancel path. Add to `ADMIN_API_ACCESS`, `routes.ts`, OpenAPI. |
| WIRE-2003 API client + hooks | FE | `class-changes.ts`; `adminClassChangeRequestsQuery`, `adminSubstituteCoachOptionsQuery`, `useCreateClassChangeRequest`, `useWithdrawClassChangeRequest`, `useApproveClassChangeRequest`, `useDenyClassChangeRequest`. |
| WIRE-2004 Forms | FE | `class-change-form.schema.ts` and the deny-note form submit through hooks. |
| WIRE-2005 Seeder | BE | `seed/class-changes.ts`: the 3 requests from `class-change-fixtures.ts` (pending reschedule, approved cancel, denied substitute) against seeded sessions and `staff-rex` / `staff-ephraim`. |
| WIRE-2006 Remove mocks | FE | Remove every runtime caller of the 6 adapter methods; `class-change-fixtures.ts`, `class-change-engine.ts` stay for Storybook. |

**Depends on:** E04, E06, E15, E02. **Source docs:** `admin/05-schedule-management.md` (#337 section), `openspec/specs/fe-admin-screens.md`.

---

## WIRE-E21 — Coach Students

**Backend state:** no route. RLS helper `app_private.coach_can_read_customer` exists after E00. Screens exist on the mock: `/students`, `/students/[customerId]`.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-2101 Handlers: `GET /api/admin/coach/students`, `GET /api/admin/coach/students/{customerId}` | BE | Scoped to the actor's linked `coachId` (403 without one); list = customers with a booking on the coach's sessions, with attendance count, contribution (verified payments + consumed redemptions on those sessions), next booking; detail adds upcoming, attendance, onboarding (never referral). Add to `ADMIN_API_ACCESS`. |
| WIRE-2102 API client + hooks | FE | `coach-students.ts`; `coachStudentsQuery`, `coachStudentDetailQuery`. |
| WIRE-2103 Remove mocks | FE | Remove every runtime caller of `getCoachStudents`, `getCoachStudent`; they stay for Storybook. |

**Depends on:** E08, E11, E12, E15 (coach link), E02. **Source docs:** `admin/20-coach-students.md`.

---

## WIRE-E03 — No more mocks (closeout)

**Goal:** `@balanse/mock` is gone from runtime in both apps and survives only as a Storybook dev dependency (decision 1).

**Current state:** ~115 runtime files import `@balanse/mock`; both `next.config.ts` list it in `transpilePackages`; `apps/admin/.storybook/preview.tsx` and every story use fixtures and the mock principal decorator; `packages/mock/src/runtime.ts` knobs (`latencyMs`, `failNext`, `failPublicSessions`, `sessionBecameFullId`, `failProofUpload`, `emptyAdminQueues`) drive Storybook and the web calendar scenario switcher.

| Task | Lane | Scope |
| --- | --- | --- |
| WIRE-0301 Mock package becomes dev-only | FE | Move `@balanse/mock` to `devDependencies` in both apps and drop it from `next.config.ts` `transpilePackages` (Storybook keeps its own config). Mark the package Storybook-only in its README. Stories keep `getMockAdapter()`, fixtures, `MOCK_NOW_ISO`, runtime knobs, and the mock principal decorator. |
| WIRE-0302 Storybook data layer | FE | The Storybook `Providers` tree injects a mock-backed implementation of `@balanse/api-client` (same typed functions, resolved against the in-browser `MockDataAdapter`) so the React Query hooks work in stories without a server. No MSW. |
| WIRE-0303 Prune unused mock code | FE | Delete only the adapter methods, fixtures, and engines that no story or `.storybook/` file imports (verify with a grep over `*.stories.tsx`, `*.stories-data.ts`, `.storybook/`). Everything a story uses stays. |
| WIRE-0304 Web harness | FE | Delete `apps/web/src/modules/dev-harness/MockSessionHarness.tsx` (calendar scenario switcher) and `NEXT_PUBLIC_ENABLE_MOCK_HARNESS` / `NEXT_PUBLIC_APP_MODE` from env examples. |
| WIRE-0305 Docs and specs | FE | Update `AGENTS.md` (“mocks only” phase statement, Data section), `docs/ways-of-working.md` (`lib/` row, self-service writes paragraph), `docs/engineering/mock-harness-removal.md` (close), `docs/backend/api-routes.md` ("Screens stay mock-only"), OpenSpec `fe-shared-systems` and `fe-foundation` deltas, `fe-screen-ticket-checklist.md` ("Data only via `getMockAdapter()`" → API client). |
| WIRE-0306 Verification | FE+BE | `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`; a grep for `@balanse/mock` outside stories returns nothing; WIRE-013 canonical-loop walkthrough against hosted. |

**Depends on:** every entity epic.

---

## Decisions (answered 2026-10-02)

1. **Storybook keeps mocks.** `@balanse/mock` stays as a Storybook-only dev dependency; stories keep `getMockAdapter()`. (WIRE-E03)
2. **Several payment accounts can be active at once.** (WIRE-1701)
3. **Seed the synthetic queue customers too.** Generate placeholder profiles for every `cust-q-*` id. (WIRE-0806)
4. **Add the event image upload route now.** (WIRE-1302)
5. **Profile edits go through `PATCH /api/me`.** The direct Supabase write path is removed. (WIRE-1102)
6. **Avatar goes through `POST/DELETE /api/me/avatar`.** Direct Storage upload is replaced. (WIRE-1103)
7. **Extend the admin class routes.** They become the single write path; the catalogue cookie sign-in goes away with E02. (WIRE-0501)
8. **Seed dates stay fixed.** No relative-to-now mode. (WIRE-0412)
9. **Coach rates stay at the placeholder 500.** Rex corrects them in the admin. (WIRE-0601)
10. **GitHub: one issue per epic, tasks as checklists.** No per-task issues.

## Not in these epics

Customer login / password reset flows (live, auth only); admin notification preferences (mock-only by spec); contact form submission (mock-only by spec); achievements placeholder; serving coach/marketing imagery from Storage (WIRE-012); payment gateways, memberships, notifications (future scope per `business-requirements/19-future-scope.md`).
