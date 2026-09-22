# RLS policy suite (BE-020 + #298)

RLS is enabled on every business table in `public`. `developer_config` and `app_meta` have RLS on and **no** policies for `anon`/`authenticated` (Data API closed). Prisma uses the database owner / service role and **bypasses RLS**.

Equivalent checks must live in BE-030+ route handlers (#292 owns API authorization).

## Staff authorization helpers

| Helper | Meaning |
| --- | --- |
| `public.is_admin()` | **Super Admin compatibility only.** Active, non-system staff whose `staff_role_definitions.allAccess` or `builtInKey = super_admin`. Do **not** treat this as “any staff”. |
| `app_private.has_permission(uid, key)` | Canonical deny-by-default check. Super Admin `allAccess` grants every registry key. |
| `app_private.owns_session(uid, session_id)` | `session_coaches.coachId` equals the Coach linked by `coaches.staffMemberId`. Never names or emails. |

Do **not** read `user_metadata` / `raw_user_meta_data` for authz.

`is_admin()` was **not** broadened to Front Desk or Coach. Old full-access policies that still call `is_admin()` therefore remain Super-Admin-only. Operational tables gained explicit `has_permission` / own-scope policies.

The leftover `staff_members.role` enum (`ADMIN`) is not consulted by these helpers.

| Table | anon | customer (`authenticated`) | Front Desk | Coach role | Super Admin |
| --- | --- | --- | --- | --- | --- |
| `coaches` | public columns of active rows | same | public columns (`coaches.read` via catalogue policy) | same | write + rates (column grants still omit rates from Data API) |
| `coaches_public` | select public columns | select | select | select | select |
| `session_coaches` | — | — | — | — | select/write (rate snapshots). `coach_rates.read` for select |
| `classes` / `sessions` | published/active read | same | all sessions (`schedule.read.all`); class write needs `classes.manage` | own assigned sessions (`schedule.read.own`) | all |
| `profiles` | — | own row | `customers.read` | own profile only | all |
| `bookings` | — | own; insert only waitlist/hold; cannot set `CONFIRMED`/`CHECKED_IN` | queue + roster (`bookings.read` / `roster.read.all`); attendance | own-session roster / attendance | all |
| `payments` | — | own booking; cannot verify | `payments.read` / review / cash | — | all |
| `refunds` | — | — | — | — | `refunds.read` / `refunds.manage` |
| `waitlist_entries` / requests / acceptances | — | own | matching booking / cancel / reschedule keys | own-session waitlist read | all |
| `staff_members` | — | own limited columns (`catalogue_staff_self`) | — | — | `staff.read` / `staff.manage` |
| `staff_role_definitions` / permissions | — | — | — | — | `roles.read` / `roles.manage` |
| `audit_events` | — | insert | — | — | select (`is_admin`) |
| `developer_config` / `app_meta` | — | — | — | — | — (postgres only) |
| `faqs` | select | select | — | — | `settings.content.manage` |
| `pending_uploads` | — | — | — | — | `is_admin` |
| `payment_qr_codes` | — | — | — | — | `settings.payment_qr.manage` |
| `payment_qr_codes_public` | select active (`id`, `imageKey`) | select | select | select | select |
| `policy_*` writes | public read | public read | — | — | `settings.policies.manage` |
| `bundles` / applicability | published select | published select | — | — | `bundles.read` / `bundles.manage` |
| `bundle_acquisitions` / payments | — | own | — | — | manage / admin |
| `customer_bundles` / `bundle_redemptions` | — | own read | — | — | manage / admin |
| `coaches.staffMemberId` | — (not on `coaches_public`) | — | — | — | admin write (BE-055) |

Negative guarantees:

- Customer A cannot read B's booking/payment/profile (`profileId` / join checks).
- Anon cannot read bookings, payments, coach rates, or reports.
- Customer cannot persist `CONFIRMED`, `CHECKED_IN`, or refund rows.
- Coach rate columns are not granted through `coaches_public` or to Front Desk / Coach on `coaches` / `session_coaches`.
- Front Desk and Coach **cannot** read staff, roles, settings, refunds, or reports through the Data API.
- Linking `Coach.staffMemberId` grants **no** extra access by itself. Own-scope requires the Coach **authorization role** (or another role with `*.own` keys) **and** a `session_coaches` assignment.
- Archived / labeled receive QRs are not granted through `payment_qr_codes_public` (BE-056).
- Customer A cannot read or spend customer B’s package entitlement (BE-058).

`session_roster_metrics` and report functions are revoked from Data API roles. Report RPCs additionally require `reports.*` when `auth.uid()` is present. #293 zeros sales/cost columns on class/session report RPCs unless the JWT holds the matching key (`20260922181200`).

Policies use `(SELECT auth.uid())` / `(SELECT app_private.has_permission(...))` so Postgres can cache the value once per statement (init-plan).

Supabase advisor review (hosted project not migrated by this PR): [staff-roles.md](./staff-roles.md#hosted-project--advisors-2026-09-22).
