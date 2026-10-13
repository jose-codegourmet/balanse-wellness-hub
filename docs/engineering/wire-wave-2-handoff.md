# WIRE Wave 2 — handoff brief

For the agent building Wave 2 of the FE ↔ BE wiring. Written 2026-10-02 against the working tree at that time. Wave 0 and Wave 1 are being built **in this same checkout by other agents**; their work is on disk, uncommitted, and their issue checklists are not ticked yet. Build on what is on disk. Do not rewrite it, and do not tick their boxes.

## Your epics, in this order

| Order | Issue | Epic | Why this order |
| --- | --- | --- | --- |
| 1 | [#362](https://github.com/jose-codegourmet/balanse-wellness-hub/issues/362) | WIRE-E11 Customers and Profile | Owns the seed scaffolding (auth users + id map) every later seeder needs, and `GET /api/me`, which every portal page reads. |
| 2 | [#363](https://github.com/jose-codegourmet/balanse-wellness-hub/issues/363) | WIRE-E08 Bookings | The canonical loop. |
| 3 | [#364](https://github.com/jose-codegourmet/balanse-wellness-hub/issues/364) | WIRE-E09 Payments and Refunds | Depends on bookings. |
| 3 | [#365](https://github.com/jose-codegourmet/balanse-wellness-hub/issues/365) | WIRE-E10 Cancellations and Reschedules | Depends on bookings; independent of payments. |
| 4 | [#366](https://github.com/jose-codegourmet/balanse-wellness-hub/issues/366) | WIRE-E12 Onboarding and Referrals | Depends on #362. |

Each issue body is the task list. Tick a checkbox on the issue when its task is done. Work one epic at a time; do not start #363 until #362's API client and hooks exist, because the booking screens read the profile.

## Read first

1. `AGENTS.md` (read order, component conventions, no new tests).
2. `docs/engineering/wire-epics.md` — conventions, the ten decisions, waves. The decisions are final: profile edits and avatars go through `/api/me*`, Storybook keeps `@balanse/mock`, seed dates stay fixed, coach rates stay 500.
3. `docs/engineering/api-wiring-crosscheck.md` — what each handler really returns today versus what the screens render.
4. `apps/web/src/lib/query/README.md` and `apps/admin/src/lib/query/README.md` — the hook recipe you must follow.
5. `apps/admin/src/modules/admin/forms/README.md` — the admin form kit (`AdminForm`, bindings, field-name and money mapping).

## What already exists on disk (use it, do not duplicate it)

**`@balanse/api-client`** (`packages/api-client`, from #356):
- `apiFetchBrowser(path, init)` from `@balanse/api-client/browser` for client components; attaches the Supabase browser session token.
- `apiFetchServer(path, init, accessToken)` from `@balanse/api-client/server` for server components, server actions, and route handlers; calls `dispatch()` in-process, no network hop.
- `ApiFetcher` type: entity modules take `fetcher: ApiFetcher` as their first argument. Copy the shape of `packages/api-client/src/classes.ts`.
- `ApiError` (`status`, `code`, `fieldErrors`, `formErrors`, `isValidationFailed`, `isUnauthorized`, `isForbidden`, `isConflict`), `applyFieldErrors(form, error)` for React Hook Form, `phpToNumber` / `numberToPhp`, `getNextCursorParam`, `pageCount` / `hasNextPage`, `assertDateWindow`.
- Add your entity modules here: `customers.ts`, `bookings.ts`, `payments.ts`, `requests.ts`, `onboarding.ts`. Export them from `src/index.ts`. Keep them browser-safe: no Prisma, no `@supabase/ssr` imports.

**Web React Query layer** (`apps/web/src/lib/query/`, from #356):
- `makeQueryClient`, `webKeys` (rooted at `["web", customerId ?? "guest"]`; public catalogue keys under `["web","public",…]`), `prefetchWeb(options, children)`, `MockHydrationBoundary`, and one example query factory `classes.ts` (`publicClassesQuery(fetcher)`).
- There is **no server fetcher helper in web yet**. Add `apps/web/src/lib/query/fetcher.ts` mirroring admin's `serverFetcher(accessToken)`, and a `getCustomerAccessToken()` in `apps/web/src/modules/session/current-customer.ts` that reads `supabase.auth.getSession()` from `createSupabaseServerClient()` the same way admin's `modules/session/current-staff.ts` does.
- Pages bind the token server-side and prefetch: see `apps/admin/src/app/(dashboard)/classes/page.tsx` for the pattern (`prefetchAdmin([query(actor, serverFetcher(token))], …)`). Client components default to `apiFetchBrowser` and accept a `fetcher` prop so stories can inject a mock fetcher (see `apps/admin/src/app/(dashboard)/classes/_components/mock-class-fetcher.ts`).

**Admin React Query layer** (`apps/admin/src/lib/query/`, from #356/#357/#358):
- Already split per entity: `queries/{bookings,cancellations,customers,payments,reschedules,…}.ts` and `mutations/{bookings,cancellations,payments,reschedules,…}.ts`. Your admin files already exist and still call `getMockAdapter()`. Rewire them to `@balanse/api-client`; keep their exported names so screens keep compiling.
- `serverFetcher(token)` in `lib/query/fetcher.ts`; `getStaffSession()` and `getStaffAccessToken()` in `modules/session/current-staff.ts`.
- `useStaffActor()` from `modules/authorization/useAdminAccess.ts` replaced `useMockPrincipal()`. Query factories take `actor` (a `StaffAuthorizationActor | null`), and `adminAuthScope(actor)` keys the cache.
- `apps/admin/src/app/api/[[...path]]/route.ts` mounts the API in admin, so admin calls are same-origin.

**Web customer session** (`apps/web/src/modules/session/`, live since 2026-10-01): `getSessionUser()`, `getCurrentCustomer()`, `createSupabaseServerClient()`, `SessionProvider` / `useSession()` (client: `{ customerId, email } | null`). The customer id is the Supabase user id.

## Backend facts you build against

Routes in `packages/db/contracts/routes.ts`; handlers in `packages/api/src/handlers/{me,bookings,admin-bookings,admin-payments,admin-requests,admin-people}.ts`; SQL in `packages/api/src/sql.ts`.

| Epic | Exists today | You add on the backend |
| --- | --- | --- |
| #362 Customers | `GET/PATCH /api/me` (fullName, email, contactNumber only), `GET /api/me/policy-acceptances`, `GET /api/admin/customers` (`q`, page/pageSize), `GET /api/admin/customers/{id}` | Extend `getMe`/`patchMe` to the full `CustomerProfile` (first/last, nickname, signed `avatarUrl`, `showOnPublicRoster`, `referralCode`, `onboardingStatus`, `referralChannel`); add `POST/DELETE /api/me/avatar` on the BE-052 `pending_uploads` lifecycle; add `hasUpcoming`, `onboardingStatus`, nickname search and `AdminCustomer` shape to the list; add `onboarding` and `referral` to the detail. Prisma already has every column (`be344`). Add new routes to `routes.ts`, regenerate OpenAPI (`pnpm --filter @balanse/db db:openapi`), update `docs/backend/api-routes.md`, and run `packages/api` contract-coverage tests only to confirm the router still compiles. |
| #363 Bookings | `POST /api/bookings` (body `sessionId`, `policyVersionIds`, `entitlementId`, `intendedEntitlementId`; returns `{ kind: "hold" \| "waitlist", waitlistEntryId, booking }`), `GET /api/bookings`, `GET /api/bookings/{id}`, `GET /api/admin/bookings` (`CursorPage`; `tab`, `q`, `classId`, `date`, `limit`, `cursor`), `POST .../confirm`, `.../reject` | Nothing. Compare `presentBooking` (`packages/api/src/presenters.ts`) with `CustomerBooking` and add the fields the screens need (`session`, `targetSession`, `packageName`, `redemption`) in the presenter, not in the client. |
| #364 Payments | `POST /api/bookings/{id}/payment-method`, `POST /api/bookings/{id}/payment-proof` (no `objectKey` → mint; with `objectKey` → confirm), `GET /api/payment-instructions` (one GCash account), `GET /api/admin/payments` (`CursorPage`, `tab`), `GET /api/admin/payment-proofs/{id}/signed-url`, `POST .../record-cash`, `POST /api/admin/refunds/{id}/mark-pending`, `.../mark-refunded` | Nothing except WIRE-0901, which is **blocked** on #371 (payment account fields). Skip it; see stopgaps. |
| #365 Requests | `POST /api/bookings/{id}/cancellation-request`, `POST /api/bookings/{id}/reschedule-request`, `GET /api/admin/cancellation-requests`, `.../complete`, `.../reject`, `GET /api/admin/reschedule-requests`, `.../approve` (409 `target_session_full`), `.../reject` | Nothing. |
| #366 Onboarding | Nothing. Prisma has `ProfileOnboarding`, `ProfileClassInterest`, enums; RLS owner CRUD exists in `be344`. | `GET/PATCH /api/me/onboarding`, `POST /api/me/onboarding/complete`, `POST /api/me/onboarding/skip` as specified in #366. Referral channel rides on `GET /api/me` (#362). |

Money crosses the wire as `php_decimal` strings; map with `phpToNumber` / `numberToPhp` in the client module, never in a screen. 422 bodies go through `applyFieldErrors`. Customer routes need a Bearer token; the customer is always the token's user, never a body field.

## Stopgaps for dependencies that have not landed

| Missing | Who owns it | What you do instead |
| --- | --- | --- |
| Hosted database is 13 migrations behind; booking SQL functions do not exist there | #355 | Do not block on it and do not touch migrations. For manual testing use a local Postgres: `packages/db/scripts/prepare-plain-postgres.sql`, then `pnpm --filter @balanse/db db:deploy` and `BALANSE_ALLOW_DB_SEED=1 pnpm --filter @balanse/db db:seed`. Correctness is proven by `pnpm typecheck`, `pnpm lint`, `pnpm build`. |
| `publicSessionQuery(id)` and calendar hooks | #361 | Add a minimal `apps/web/src/lib/query/sessions.ts` with `publicSessionQuery(fetcher, id)` over the existing `GET /api/public/sessions/{id}` (thin DTO: class id/name, coaches, price, capacity, `remainingSlots`, `reservable`, `nonReservableReason`). That is enough for the booking form. Mark it `// WIRE-0407 extends this`. In `ScheduleCalendarSection.tsx` change only the `adapter.getBookings(customerId)` call to your `myBookingsQuery`; leave the sessions read to #361. |
| Class list for onboarding interests | #358 | Already exists: `publicClassesQuery` in `apps/web/src/lib/query/classes.ts`. |
| Per-form policy reads and acceptance writes for non-booking forms | #370 | For the booking, cancel, reschedule, and GCash forms, read `requiredCurrent` from `GET /api/me/policy-acceptances` and send those `versionId`s as `policyVersionIds` on `POST /api/bookings`. Remove the mock `acceptPolicies` calls from `GcashProofPage` and `PackageDetailPage` is not yours (that is #368). Leave a `// WIRE-1604` comment where per-form filtering will go. The database rejects a booking that omits any required current policy version, so always send the full list. |
| Eligible packages on the booking form | #368 | The route exists: `GET /api/sessions/{id}/eligible-packages`. Add `listEligiblePackages(fetcher, sessionId)` to your `bookings.ts` client module and a `eligiblePackagesQuery`; #368 may move it later. |
| Multi-account payment instructions | #371 | Implement `getPaymentInstructions` against today's single-account response and map it to `PaymentInstructions` with `accounts: [thatAccount]`. Skip WIRE-0901; leave it unticked with a note on #364. |
| Admin staff login for manual testing | #357 | Code against `useStaffActor()` / `getStaffSession()` / `getStaffAccessToken()`, which exist on disk. Whether a staff user can actually sign in depends on #357 and #355. |

## Files you own

- `packages/api-client/src/{customers,bookings,payments,requests,onboarding}.ts` and `index.ts` exports.
- `packages/api/src/handlers/me.ts` (extend), new `packages/api/src/handlers/onboarding.ts`, presenter additions in `presenters.ts`, `router.ts` entries, `packages/db/contracts/routes.ts`, `docs/backend/api-routes.md`, `docs/backend/uploads.md` (avatar section).
- `apps/web/src/lib/query/{fetcher,keys,customers,bookings,payments,requests,onboarding}.ts`, and the `README.md` "Deferred" section once the first screen adopts the layer.
- Web screens and forms listed in each issue: `portal/layout.tsx`, `portal/page.tsx`, `portal/bookings/**`, `portal/book/[sessionId]/**` (make `BookingForm` a React Hook Form component with `.schema.ts` + `.defaults.ts`), `modules/customer/{BookingForm,PaymentMethodPage,GcashProofPage,RescheduleRequest}.tsx` (move each into a colocated kebab-case folder when you convert it), `portal/profile/**`, `portal/welcome/**`, `components/balanse/ImageUpload.tsx` (real upload).
- Admin: `lib/query/queries/{bookings,payments,cancellations,reschedules,customers}.ts`, `lib/query/mutations/{bookings,payments,cancellations,reschedules}.ts`, `BookingPages.tsx` (remove its six direct `getMockAdapter()` calls), `PaymentPages.tsx`, `CancellationPages.tsx`, `ReschedulePages.tsx`, `CustomerListPage.tsx`, `CustomerDetailPage.tsx`.
- Seeders: `packages/db/prisma/seed/{auth,ids,customers,onboarding,bookings,payments,requests}.ts` wired into `seed.ts`.

Do not edit files owned by #355–#361 or #367–#376 beyond the stopgaps above. Do not commit or push; the owner commits. If a file you need is mid-edit by another agent (unexpected diff you did not make), say so in your report instead of overwriting.

## Definition of done per task

- The screen reads through a React Query hook, the hook calls `@balanse/api-client`, the client calls `/api/*`. No `getMockAdapter()` left in runtime files you touched; stories may keep it.
- Forms use React Hook Form + zod with colocated `.schema.ts` / `.defaults.ts`; 422s land on fields via `applyFieldErrors`; 401 redirects to `/login?returnTo=`; 403 shows the forbidden state; 409 codes map to toast copy.
- `Component.meta.ts` updated for every component whose data source changed. No new `*.test.*` files.
- Run with the pinned Node (`nvm use`; the shell default is Node 16 and `pnpm` refuses it): `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`.
- Tick the task's checkbox on the issue and leave a one-line comment naming the files when an epic is complete.
