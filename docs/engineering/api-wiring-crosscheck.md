# API Wiring Audit — Cross-check, second pass (2026-10-01, HEAD 28906d2)

Verified against: `packages/db/contracts/routes.ts`, `packages/api/src/router.ts` and handlers, `packages/mock/src/adapter.ts`, `packages/db/prisma/schema/*.prisma`, `packages/db/prisma/migrations/*`, `packages/db/prisma/seed.ts`, a regenerated runtime-caller map for every adapter method (stories, tests, and the Storybook stand-in `mock-customer-self-service.ts` excluded), and **read-only catalog queries against the hosted Supabase project `xydundrayuusqizssgby`** (migration ledgers, tables, columns, functions, policies, buckets).

## What changed between the two passes

Two commits landed while the first pass ran (`fefeb6b feat: update login` 22:17, `28906d2 fix: fixes build` 22:36). They moved customer **login, sign-up, profile, and avatar upload** in `apps/web` onto Supabase Auth and Supabase Storage. The first-pass caller map predates them. Everything below is on HEAD `28906d2`.

## Verdict

- The audit is **right about which routes exist in code** and right on **11 of 12 Gap capabilities**.
- It **grades "Ready" by route name, not payload**. Ten rows marked Ready are Partial because the HTTP DTO or Prisma model lacks fields the mock UI already renders.
- It **misses that three customer surfaces are already live** against Supabase without going through `/api`: login/sign-up, profile fields, and avatar upload.
- Its biggest blind spot is not in the code at all: **the hosted database is 13 Prisma migrations behind**. Most "Ready" handlers would fail against it today because their tables, views, and SQL functions do not exist there.

## Hosted database reality (queried 2026-10-01)

| Fact | Hosted project | Consequence |
|---|---|---|
| Supabase migration ledger | 12 entries (inf003, inf004, be001_024, be017_018 ×2, class catalogue ×2, session_coach_assignments, recurring_schedules ×2, profile_avatar_storage, profiles_self_policies) | |
| Prisma migration ledger (`_prisma_migrations`) | **2 entries** (inf003, inf004) | `prisma migrate deploy` would try to re-run be001_024 and fail. Needs `prisma migrate resolve --applied` for the 10 already applied via Supabase, then deploy the rest. |
| Prisma migrations **not applied** | be020_022 (RLS, storage policies, reporting views), be050_054, be055_056, be058, be289 ×3, be319, venues_on_sessions, expand_front_desk_access, be344 ×2, be345 = **13** | |
| Tables missing | `venues`, `session_events`, `faqs`, `pending_uploads`, `payment_qr_codes`, `bundles` + 5 bundle tables, `permission_definitions`, `staff_role_definitions`, `staff_role_permissions`, `profile_onboarding`, `profile_class_interests` | Venue, event, bundle, payment-QR, role, FAQ, upload, onboarding routes all 500 on hosted. |
| Views missing | `coaches_public`, `session_roster_metrics`, `payment_qr_codes_public` (no public views at all) | `GET /api/public/coaches` (reads `coaches_public`) and the roster/report handlers fail. |
| SQL functions missing | `public.create_reservation`, `submit_cancellation_request`, `submit_reschedule_request`, `evaluate_waitlist_promotion`, `expire_held_bookings`, `handle_new_user`; schema `app_public` absent | **Booking, waitlist, cancellation, reschedule APIs cannot run.** No auto-created profiles on sign-up. Public session/event/roster functions absent. |
| `sessions` columns | no `venueId` | `POST /api/admin/sessions` (requires `venueId`) fails. |
| `profiles` columns | `id, fullName, email, contactNumber, createdAt, updatedAt, avatarKey` only | `saveProfileFields` falls back to `fullName`/`contactNumber`; **nickname, roster visibility, onboarding timestamps are silently dropped** on hosted today. |
| `coaches` columns | no `staffMemberId` | BE-055 staff↔coach link absent. |
| Trigger `on_auth_user_created` | absent | App inserts the profile row on first write (`ensureProfileRow`). |
| Storage buckets | `avatars`, `coach-photos`, `marketing-assets`, `payment-proofs` all present | |
| Seed (BE-023) | not run: 0 sessions, 0 policy documents, `app_meta` has only `schema_version` | Only the class-catalogue import (9 classes, 11 placeholder coaches, 17 marketing assignments) and 4 real test profiles exist. |
| RLS | `profiles` has 3 self policies (added today). **`_prisma_migrations` has RLS disabled** and is readable/writable with the anon key (Supabase advisor, critical) | Pre-existing finding already noted in `docs/backend/class-catalogue.md`. Remediation Supabase suggests, for you to decide on (enabling RLS with no policies blocks all client access to that table, which is fine for a Prisma bookkeeping table): `ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;` |

**Implication for tickets:** a "reconcile migration ledgers and deploy the 13 pending migrations to `xydundrayuusqizssgby`" ticket is a hard prerequisite for every wiring ticket and for any seeder beyond classes/coaches. `docs/backend/class-catalogue.md` already warns not to blindly deploy; the two ledgers confirm why.

## Corrections to the audit

| # | Audit said | Repo shows | Reclassify |
|---|---|---|---|
| 1 | Public session detail: **Gap**, no route in inventory | `GET /api/public/sessions/{id}` is BE-030 (`routes.ts:13`, `handlers/public.ts`). Returns the thin `PublicSession` DTO: no venue, class slug, hero image, or linked event. `api-contracts.md:25-33` documents the rich shape as "not implemented this phase". | **Partial** — extend, don't create |
| 2 | Policy-acceptance write: **Gap** | `POST /api/bookings` and `/waitlist` take `policyVersionIds`; SQL `create_reservation` inserts `booking_policy_acceptances` **and then `assert_required_acceptances` rejects the booking unless every `required=true` document's current version is included** (migration be017_018 lines 477-489, 232-255). `BookingPolicyAcceptance.bookingId` is non-nullable, so sign-up, package, GCash, contact, cancel, reschedule acceptances cannot be stored. Sign-up records them in the mock only (`sign-up-actions.ts` comment). | Booking: **Ready** (with a global-required rule that differs from the mock's per-form model). Other forms: **Gap, schema first** |
| 3 | Profile basic details: **Ready** via `GET/PATCH /api/me`; "frontend remains mock-only" | HTTP `getMe`/`patchMe` carry only `fullName`, `email`, `contactNumber`. Meanwhile `apps/web/src/modules/session/current-customer.ts` **already reads/writes `profiles` through Supabase** (server-only, RLS own-row), and portal pages call `getCurrentCustomer()` instead of `adapter.getMe` (adapter `getMe` now has 2 callers, down from 8). `uploads.md:27`: "`PATCH /api/me` … not authorized yet". | **Live DB (direct Supabase) + HTTP Partial** |
| 4 | Customer avatar: **Gap**, "handlers explicitly not authorized" | `apps/web/src/modules/session/avatar-storage.ts` **uploads/removes avatars in the private `avatars` bucket as the signed-in user** and sets `profiles.avatarKey`; served via 1-hour signed URLs. Bypasses `/api` and the BE-052 `pending_uploads` mint/confirm lifecycle. `docs/backend/uploads.md` still says "no handler this phase" — stale. Adapter `setMyAvatar` has no runtime caller. | **Live DB (direct Supabase Storage)**. Decide whether an `/api/me/avatar` handler is still wanted. |
| 5 | Sign-up excluded as auth | `createCustomerAccount` uses `supabase.auth.signUp` / Google callback; adapter `createCustomer` has **no runtime caller**. Product-data side effects (profile row, policy acceptances for `sign_up`, share attribution) are split: profile → Supabase, acceptances → mock. | Note in tickets; add `createCustomer` to dormant list |
| 6 | Payment QR: **Ready** (BE-056) | Prisma `PaymentQrCode` = `label, imageKey (unique, non-null), isActive, archivedAt`; one-active rule. UI adds `type` (GCASH/MAYA/QRPH), `accountName`, `accountNumber`, nullable `imageKey`, several active. `GET /api/payment-instructions` returns one GCash account; UI wants `accounts[]`. | **Partial** — schema + contract |
| 7 | Venues: **Ready** | No `openingHours`, `studioOwned` in `Venue` or `presentAdminVenue`. | **Partial** (minor) |
| 8 | Create/edit session: **Ready** | `upsertAdminSession` has `name`, `bookable`; `GymSession` has neither; `postAdminSession` ignores them. | **Partial** |
| 9 | Roster: **Ready** (BE-040) | HTTP rows carry `name` (fullName) only; no `people` identity map (nickname/avatar/showOnPublicRoster/onboarding); shape differs (`waitlist` vs `waitlisted`, labelled `metrics` map). | **Partial** |
| 10 | Customer directory: **Ready** | HTTP: `q` only, paginated, `{id,name,contact,upcoming,lastVisit}`. Mock: `query` (incl. nickname), `hasUpcoming`, `onboardingStatus`, full `AdminCustomer`. | **Partial** |
| 11 | Customer detail: **Ready** | No `onboarding`, `referral`, nickname, avatar; different grouping. | **Partial** |
| 12 | Admin class HTTP: **Ready** (BE-038) | `POST/PATCH /api/admin/classes` accept `name, shortDescription, defaultDurationMinutes, defaultCustomerPrice, active`; slug derived. No `customPageUrl`, `description`, `heroImage`, `galleryImages`, `coachIds`. | **Partial** — live RPC is the only full write path |
| 13 | Bundles: **Ready** (BE-058) | No per-package credit metrics (`granted/held/used/restored/owners`) on any HTTP route; `BundleListPage` reads `getAdminBundleMetrics`. CRUD/status/grant/revoke/review are present. | **Partial** (metrics) |
| 14 | Events: **Ready** | Create/patch accept every mock field. HTTP list lacks the mock's `search` filter. | Ready (minor) |
| 15 | Join waitlist: `BookingForm` → `/waitlist` | `joinWaitlist` has no caller; `BookingForm` calls `createBooking` for both intents; `POST /api/bookings` returns `kind: hold \| waitlist`. | Route not needed by current UI |
| 16 | Dormant list (5) | Confirmed, plus `joinWaitlist`, `getAdminBundle`, `createCustomer`, `setMyAvatar` (route callers; Storybook stand-in only). | 9 dormant |
| 17 | Direct adapter calls: `BookingPages` | Confirmed (6 calls). Also `sessions/[sessionId]/roster/page.tsx` (`getAdminSessions` for coach-scope guard) and `ClassCatalogueProvider` (mock mode). `AdminSidebar`/`/payments` go through the query layer; the query README's note is stale. | |

Confirmed unchanged: no `fetch("/api/…")` anywhere in either app; contact form mock-only (`fe-public-screens.md:8`); admin notification prefs mock-only (`fe-admin-screens.md:22`); `GET /api/public/content` dormant (FAQ/About/Contact pages render static domain copy, so admin content edits never reach public pages); class catalogue Live DB on both sides; all remaining Gaps (event page, roster, onboarding HTTP, referral read, class-change, My Students, marketing insights, policy CRUD, policy-form requirements).

## Architecture facts the audit does not state (needed for tickets)

- **`@balanse/api` is mounted only in `apps/web`** (`app/api/[[...path]]/route.ts`). `apps/admin` has no `/api` folder, no `@supabase/*` dependency, and still runs on the mock principal cookie (`apps/admin/middleware.ts`, page files). Every `/api/admin/*` handler requires a Supabase Bearer token for an active staff row (`auth.ts resolveActor`). Admin wiring therefore depends on: admin Supabase Auth (WIRE-002, "apps/admin is unchanged" per `mock-harness-removal.md`), plus either mounting `dispatch()` in admin or calling web's `/api` cross-origin.
- **In `apps/web`, 8 adapter callers are client components** (`BookingForm`, `GcashProofPage`, `PaymentMethodPage`, `RescheduleRequest`, `CancellationRequest`, `PackageDetailPage`, `ScheduleCalendarSection`, `use-viewer-share-params`) and 2 are server actions; the rest are server components/loaders. Client callers need either a token-bearing fetch client or conversion to server actions. Server components could call `dispatch()` in-process instead of HTTP.
- **Customer identity is now the Supabase user id** (`profiles.id = auth.users.id`, UUID). The mock mirrors it via `ensureCustomer` so mocked bookings/packages/onboarding key off the real id. New accounts start with no mock bookings.
- `app_public.public_session_roster` scopes by `auth.uid()`. A handler running on service-role Prisma gets anon counts only; it must run as the caller (or the function must take an explicit viewer).

## Cross-cutting gaps (revised)

| Capability | Schema? | HTTP? | Notes |
|---|---|---|---|
| Deploy 13 pending migrations + reconcile ledgers | **Yes (prereq)** | — | Blocks nearly everything else on hosted. |
| Public session **page** | No | Extend | `app_public.public_session` |
| Public event page | No | New | `app_public.public_event` |
| Public roster | No | New | viewer-scoped; signed avatar URLs |
| Per-form policy requirements | **Yes** | Admin write + public read | `PolicyDocument.required` is global |
| Policy acceptance for non-booking forms | **Yes** (nullable `bookingId` + `form`) | New | booking path exists |
| Onboarding answers read/write | No | New | completion/skip already written to `profiles` by `saveProfileFields` |
| Referral channel read | No | Fold into `GET /api/me` | |
| Avatar | No | **Decide**: keep direct Storage path or add `/api/me/avatar` | live today via direct Storage |
| Profile identity on `GET/PATCH /api/me` | No | Extend (or keep direct Supabase path) | |
| Coach class-change requests | **Yes (new model)** | New | |
| Coach-scoped students | No | New | `coach_can_read_customer` RLS helper exists in be344 |
| Marketing insights | No | New | all source columns exist after be344 |
| Policy document CRUD | No | New | roadmap listed `/api/admin/policies` but it was never contracted |
| Payment account type/name/number, several active | **Yes** | Extend BE-056 | |
| Session `name` / `bookable` | **Yes** | Extend BE-038 | |
| Venue `openingHours` / `studioOwned` | **Yes** | Extend | |
| Roster identity (`people`) | No | Extend BE-040 | |
| Customer directory filters + identity | No | Extend BE-042 | |
| Bundle credit metrics | No | Extend BE-058 | |

Dormant adapter methods (do not ticket): `getPublicContent`, `getBundleAudit`, `getAdminCustomerEntitlements`, `expireHeldBooking`, `promoteWaitlistedBooking`, `joinWaitlist`, `getAdminBundle`, `createCustomer`, `setMyAvatar`.

## Mock data → seeders

### Already in place

- `packages/db/prisma/seed.ts` (BE-023): idempotent upserts, gated by `BALANSE_ALLOW_DB_SEED=1` and `BALANSE_ALLOW_SHARED_PROJECT_SEED=1`, `isPlaceholder` flags. Seeds roles/permissions, developer config, 11 coaches (`coach_rex`…), 13 classes (`class_yoga`…), 2 placeholder policy docs, 1 venue, one timetable week (14–20 Sep 2026), `app_meta.public_settings`. **Has never run on hosted.** It also upserts into `venues` and `staff_role_definitions`, which do not exist on hosted yet.
- Class-catalogue migration already inserted 9 classes with marketing copy + 17 marketing-coach rows (the `class-content.ts` material) — present on hosted.

### Fixture → model map

| Fixture (`packages/mock/src/`) | Count | Target | Blocker |
|---|---|---|---|
| `publicClasses` + `class-content.ts` | 9 | `GymClass`, `ClassMarketingCoach` | Already in DB. Ids differ (`class-yoga` vs `class_yoga`). |
| `coachRows` | 11 | `Coach` | Same humans; ids `coach-rex` vs `coach_rex`; realistic rates vs placeholder 500. |
| `venue-fixtures.ts` | 4 | `Venue` | Table missing on hosted. `openingHours`/`studioOwned` have no columns. |
| `publicSessions` | 12 showcase | `GymSession`, `SessionCoach` | Demo states need bookings; `name` has no column; `venueId` column missing on hosted. |
| `event-fixtures.ts` | 3 + 3 sessions | `SessionEvent`, `GymSession` | Table missing on hosted. Poster site-paths are allowed (no DB check on `posterImage`; `heroImage` precedent). |
| `bundleDefinitions` | 3 | `Bundle`, `BundleClassApplicability` | Tables missing on hosted. |
| bundle acquisitions / entitlements / redemptions | 4 / 3 / 7 | `BundleAcquisition`, `CustomerBundle`, `BundleRedemption` | Need profiles first. |
| `coreCustomers` + `communityMembers` | 3 + 12 | `Profile` | **UUID ids** (`Profile.id @db.Uuid`): mock ids like `cust-ana` cannot be kept. Need `auth.users` via Admin API; no `handle_new_user` trigger on hosted, so insert the profile row yourself. `firstName` non-blank, `nickname` 2–30 checks. |
| `onboardingFixtures`, `referralFixtures`, `signupDates` | 13 / 5 / 15 | `ProfileOnboarding`, `ProfileClassInterest`, `profiles.*` | Tables/columns missing on hosted (be344). Referral order: `cust-ben` → `cust-m-01` → `cust-m-05`, `cust-m-08`. Mock `referralCode`s can be set explicitly. |
| `MOCK_AVATAR_URLS` (SVG site paths) | 6 | `profiles.avatarKey` | **Cannot be stored**: DB check requires `avatars/<profileId>/<id>.(webp\|jpg\|jpeg\|png)`. Upload placeholder WEBPs to the bucket or leave null. |
| `policyAcceptances` | 2 | `BookingPolicyAcceptance` | Needs a booking (non-null `bookingId`). |
| `bookings` | 1 per status + community + ~120 queue rows | `Booking`, `Payment`, `Refund`, `WaitlistEntry`, `CancellationRequest`, `RescheduleRequest` | Queue rows reference `cust-q-*` with no profile. `bookingReference` is unique/required. HELD rows expire via BE-017 job unless `holdExpiresAt` is future. |
| `mockStaffRoles` | 3 custom roles | `StaffRoleDefinition`, `StaffRolePermission` | Tables missing on hosted. Seedable without auth once present. |
| `mockStaffMembers` | 7 | `StaffMember` | `userId` is UUID → needs `auth.users`. `StaffMember.id` can stay `staff-rex`. |
| `paymentAccountFixtures` | 3 | `PaymentQrCode` | Table missing on hosted; needs `type/accountName/accountNumber`; Maya row has null `imageKey` (column non-null unique); two active rows violate one-active rule. |
| `adminSettings` / `publicContent` / `paymentInstructions` | — | `AppMeta.public_settings`, `FaqItem` | `faqs` table missing on hosted. `policyFormRequirements` needs schema. |
| `classChangeRequestFixtures` | 3 | none | Needs model. |
| `dashboard-series.ts` | — | — | Derived. |

### Constraints to encode in the seeder ticket

1. **Prerequisite:** reconcile the two migration ledgers (`prisma migrate resolve --applied` ×10, then `migrate deploy`), after reviewing each pending migration against the hosted schema as `class-catalogue.md` asks.
2. **Id convention:** mock hyphen ids vs seed underscore ids vs catalogue-import ids. Pick one, or seed by slug/name.
3. **UUID identities:** customers and staff get new UUIDs from `auth.users`; keep a mock-id → UUID map inside the seeder so bookings/entitlements/referrals resolve.
4. **`isPlaceholder` exists only on** `Coach`, `GymClass`, `GymSession`, `PolicyDocumentVersion`, `SessionEvent`. Profiles, bookings, bundles, venues, staff, payment QRs cannot be flagged; mark them via naming (`(placeholder)`) or a seed manifest instead.
5. **Dates:** mock `MOCK_NOW_ISO = 2026-09-16`; seed `WEEK_START = 2026-09-14`. Offer a relative-to-now mode or accept staleness on demo DBs.
6. **Auth-backed rows** only through the Supabase Admin API, server-side, service role, never on the shared project without the explicit flag.
7. **Required-policy rule:** seeded bookings must include acceptances for every `required=true` current policy version or `create_reservation` (once deployed) will reject them; seed directly via Prisma to bypass, but keep acceptances consistent.
8. **Schema-first fixtures:** payment account fields, session `name`/`bookable`, venue fields, class-change model, policy-form requirements, nullable acceptance `bookingId`.
