# RLS policy suite (BE-020 + #298)

RLS is enabled on every business table in `public`. `developer_config` and `app_meta` have RLS on and **no** policies for `anon`/`authenticated` (Data API closed). Prisma uses the database owner / service role and **bypasses RLS**.

Equivalent checks must live in BE-030+ route handlers (#292 owns API authorization).

## Staff authorization helpers

| Helper | Meaning |
| --- | --- |
| `public.is_admin()` | **Super Admin compatibility only.** Active, non-system staff whose `staff_role_definitions.allAccess` or `builtInKey = super_admin`. Do **not** treat this as “any staff”. |
| `app_private.has_permission(uid, key)` | Canonical deny-by-default check. Super Admin `allAccess` grants every registry key. |
| `app_private.owns_session(uid, session_id)` | `session_coaches.coachId` equals the Coach linked by `coaches.staffMemberId`. Never names or emails. |
| `app_private.coach_can_read_customer(uid, profile_id)` | #344 coach own-student scope: `roster.read.own` **and** the customer has a booking in a session assigned to the caller's linked coach. Used by `profiles`, `profile_onboarding`, `profile_class_interests`. |

`authenticated` holds `EXECUTE` on `app_private.has_permission`, `is_admin`, `linked_coach_id` and `owns_session` (granted by `20261001090100`). Policy expressions run with the caller's privileges, and #298 had revoked these helpers from `PUBLIC` without granting them back, so every policy that called them raised `permission denied for function has_permission` for Data API callers. `app_private` is not an exposed Data API schema.

Do **not** read `user_metadata` / `raw_user_meta_data` for authz.

`is_admin()` was **not** broadened to Front Desk or Coach. Old full-access policies that still call `is_admin()` therefore remain Super-Admin-only. Operational tables gained explicit `has_permission` / own-scope policies.

The leftover `staff_members.role` enum (`ADMIN`) is not consulted by these helpers.

| Table | anon | customer (`authenticated`) | Front Desk | Coach role | Super Admin |
| --- | --- | --- | --- | --- | --- |
| `coaches` | public columns of active rows | same | public columns (`coaches.read` via catalogue policy) | same | write + rates (column grants still omit rates from Data API) |
| `coaches_public` | select public columns | select | select | select | select |
| `session_coaches` | — | — | — | — | select/write (rate snapshots). `coach_rates.read` for select |
| `classes` / `sessions` | published/active read | same | all sessions (`schedule.read.all`); class write needs `classes.manage` | own assigned sessions (`schedule.read.own`) | all |
| `profiles` | — | own row; **update only** `firstName`, `lastName`, `nickname`, `avatarKey`, `showOnPublicRoster`, `contactNumber`, `onboardingCompletedAt`, `onboardingSkippedAt` (column grants) | `customers.read` | own profile + own students (`coach_can_read_customer`) | all (same column grants through the Data API) |
| `profile_onboarding` / `profile_class_interests` (#344) | — | own rows, full CRUD | select (`customers.read`) | select own students only (`coach_can_read_customer`) | select |
| `bookings` | — | own; insert only waitlist/hold; cannot set `CONFIRMED`/`CHECKED_IN` | queue + roster (`bookings.read` / `roster.read.all`); attendance | own-session roster / attendance | all |
| `payments` | — | own booking; cannot verify | `payments.read` / review / cash | — | all |
| `refunds` | — | — | — | — | `refunds.read` / `refunds.manage` |
| `waitlist_entries` / requests / acceptances | — | own | matching booking / cancel / reschedule keys | own-session waitlist read | all |
| `staff_members` | — | own limited columns (`catalogue_staff_self`) | — | — | `staff.read` / `staff.manage` |
| `staff_role_definitions` / permissions | — | — | — | — | `roles.read` / `roles.manage` |
| `audit_events` | — | insert | — | — | select (`is_admin`) |
| `developer_config` / `app_meta` | — | — | — | — | — (postgres only) |
| `faqs` | select | select | — | — | `settings.content.manage` |
| `pending_uploads` | — | — (customer avatar intents are written server-side with `profileId`, #344) | — | — | `is_admin` |
| `payment_qr_codes` | — | — | — | — | `settings.payment_qr.manage` |
| `payment_qr_codes_public` | select active (`id`, `imageKey`) | select | select | select | select |
| `policy_*` writes | public read | public read | — | — | `settings.policies.manage` |
| `bundles` / applicability | published select | published select | — | — | `bundles.read` / `bundles.manage` |
| `session_events` | — | — | select (`events.read`) | — | read + write (`events.read` / `events.manage`; `is_admin()`) |
| `venues` | — | — | select (`schedule.read.all` / `events.read`) | select (`schedule.read.own`) | select + insert/update (`classes.manage`; `is_admin()`); no delete grant |
| `bundle_acquisitions` / payments | — | own | — | — | manage / admin |
| `customer_bundles` / `bundle_redemptions` | — | own read | — | — | manage / admin |
| `coaches.staffMemberId` | — (not on `coaches_public`) | — | — | — | admin write (BE-055) |

Negative guarantees:

- Customer A cannot read B's booking/payment/profile (`profileId` / join checks).
- Anon cannot read bookings, payments, coach rates, or reports.
- Customer cannot persist `CONFIRMED`, `CHECKED_IN`, or refund rows.
- Coach rate columns are not granted through `coaches_public` or to Coach. Front Desk can read them only through its explicit `coach_rates.read` permission.
- Front Desk has its explicit role-read, content-settings, refund, and coach-cost/session-report permissions through the Data API; it cannot read staff or alter roles. Coach has none of those capabilities.
- Linking `Coach.staffMemberId` grants **no** extra access by itself. Own-scope requires the Coach **authorization role** (or another role with `*.own` keys) **and** a `session_coaches` assignment.
- Archived / labeled receive QRs are not granted through `payment_qr_codes_public` (BE-056).
- Customer A cannot read or spend customer B’s package entitlement (BE-058).
- Anon and customers cannot read or write `session_events` directly. Coach has neither `events.read` nor `events.manage`. Front Desk can select (`events.read`) and cannot write. Public read goes **only** through `app_public.public_event` (#345), which never returns `internalNotes` or `isPlaceholder`. Do not grant table `SELECT` to anon.
- Customers cannot write `referralCode`, `referredById`, `referralChannel`, `email` or `fullName` (no column grant). `fullName` is derived by trigger `profiles_sync_full_name`.
- `profiles.avatarKey` can only point inside the owner's own `avatars/<id>/` prefix (check constraint), so a customer cannot surface another person's photo through the roster.
- Onboarding answers are never returned by any public or customer-to-customer surface. Customer self-edits to profile/onboarding rows do not write `audit_events`; staff reads are not audited.

`session_roster_metrics` and report functions are revoked from Data API roles. Report RPCs additionally require `reports.*` when `auth.uid()` is present. #293 zeros sales/cost columns on class/session report RPCs unless the JWT holds the matching key (`20260922181200`).

Policies use `(SELECT auth.uid())` / `(SELECT app_private.has_permission(...))` so Postgres can cache the value once per statement (init-plan).

## Public read functions (#345)

Migration `20261001090200_be345_create_public_read_functions`. Schema `app_public` (`USAGE` to `anon`, `authenticated`, `service_role`). All three are `SECURITY DEFINER`, `STABLE`, `SET search_path = ''`; `EXECUTE` is granted to `anon` and `authenticated` only (plus `service_role`). Underlying tables stay closed to anon (`session_events`, `venues`, `profiles`, `bookings`, `session_coaches`, onboarding tables re-revoked). `sessions` / `classes` / public coach columns keep their existing catalogue grants.

| Function | Returns | Rows when |
| --- | --- | --- |
| `app_public.public_session(p_session_id text)` | `session_id`, `class_id`, `class_name`, `class_slug`, `occurrence_title` (always `NULL`: no session title column yet), `starts_at`, `ends_at`, `capacity`, `remaining_slots`, `customer_price`, `status`, `venue_name`, `venue_address`, `coaches` (jsonb `[{id, name, specialties, photoKey}]`), `event_id`, `event_title`, `event_status` | session `PUBLISHED` or `CANCELLED`. Event columns only for an event that is `PUBLISHED` / `CANCELLED`; `event_status` is `CANCELLED` when the session is. Never venue `notes`. |
| `app_public.public_event(p_event_id text)` | `event_id`, `title`, `summary`, `description`, `poster_image`, `gallery_images`, `beneficiary`, `what_to_bring`, `registration_opens_at`, `registration_closes_at`, `status` (effective), plus the session columns above (`session_status` instead of `status`) | event `PUBLISHED` / `CANCELLED` **and** session `PUBLISHED` / `CANCELLED`. `DRAFT` / `ARCHIVED` → no row. Session `CANCELLED` forces `status = CANCELLED` (`events.md` R3). Never `internalNotes` / `isPlaceholder`. |
| `app_public.public_session_roster(p_session_id text)` | one row: `going_count`, `spots_left`, `hidden_count`, `attendees` (jsonb array of `{row_key, display_name, avatar_key, initials, is_self}`) | session `PUBLISHED` / `CANCELLED`; otherwise no row. |

`remaining_slots` / `spots_left` = `GREATEST(capacity - app_private.session_consumed_capacity(id), 0)` (held bookings still consume capacity). `going_count` = `CONFIRMED` + `CHECKED_IN` bookings, opted-out included.

### Roster visibility matrix

| Caller | `going_count` / `spots_left` | `attendees` | `hidden_count` |
| --- | --- | --- | --- |
| anon (`auth.uid()` is null) | yes | `[]` | `0` |
| authenticated customer (booked or not) | yes | `CONFIRMED` / `CHECKED_IN` attendees with `showOnPublicRoster = true`, **plus the caller's own row even if opted out** (`is_self = true`; UI shows "only you can see this") | opted-out going attendees, excluding the caller |
| staff / Super Admin | same as customer (same shape; admin uses its own roster for full data) | same | same |

Attendee fields: `display_name = coalesce(nullif(trim(nickname), ''), trim(firstName))`, `avatar_key` (nullable), `initials = upper(first letter of firstName + first letter of lastName)`, `is_self`, `row_key = left(sha256(bookingId || ':' || sessionId), 24)` (opaque, stable per booking). Order: `checkedInAt` asc (nulls last), then `reservedAt` asc; neither timestamp is returned. **Never returned:** `lastName`, `email`, `contactNumber`, `profileId`, `bookingId`, booking/payment status, reservation time, onboarding answers.

### Calling it and avatars

`auth.uid()` decides anon vs authenticated. A server caller must run the function with the viewer's JWT (Supabase client with the user session and `app_public` added to **API → Exposed schemas**, a human dashboard step) or, through Prisma, inside a transaction after `set_config('request.jwt.claims', '{"sub":"<uid>","role":"authenticated"}', true)` (and `request.jwt.claim.sub` for plain Postgres). Prisma without claims gets the anon shape.

The server mints short-lived (about 10 minutes) signed URLs for returned `avatar_key` values with the service role; the `avatars` bucket stays private. Hidden attendees' keys are never returned, so no URL is minted for them.

**Known caveat (follow-up):** the `#344` key convention `avatars/<profileId>/<cuid>.webp` embeds the profile UUID, so `avatar_key` and the signed URL path reveal the attendee's profile id to signed-in viewers. The future handler should return only the signed URL (never `avatar_key`) and, if ids must stay fully private, proxy avatar bytes or move to an opaque per-profile folder.

### Index

The roster filters `bookings` by `("sessionId", status)`, covered by `bookings_sessionId_status_idx`, and joins `profiles` by primary key. No partial index was added; capture `EXPLAIN` on the hosted project before adding one.

Supabase advisor review (hosted project not migrated by this PR): [staff-roles.md](./staff-roles.md#hosted-project--advisors-2026-09-22).
