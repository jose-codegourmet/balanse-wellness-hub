# Supabase Auth and admin access

**INF-005.** Providers and URLs are configured on project `xydundrayuusqizssgby`. FE screens stay mock-only this phase (`WIRE-002` later). Role rows are `BE-003`.

Profile rows (`BE-002`) are created by trigger `on_auth_user_created` → `app_private.handle_new_user`. OQ-3 still forbids DOB / health / emergency contact.

## Customer app wiring (`apps/web`, 2026-10-01)

The mock principal and harness customer switcher are gone from `apps/web`. Server-side only (`@supabase/ssr`, publishable key, cookies):

| Route / module | Role |
| --- | --- |
| `src/proxy.ts` | Refreshes the session cookie on every page request; guests on `/portal/**` go to `/login?returnTo=…`. |
| `GET /auth/google?returnTo=` | Starts Google OAuth (PKCE) for log in and sign up. |
| `GET /auth/callback?code=&returnTo=` | OAuth and email-confirmation target. New accounts (no `contactNumber`) go to `/sign-up` to finish; others to `returnTo`. |
| `POST /auth/sign-out` | Portal logout. |
| `modules/session/current-customer.ts` | `getSessionUser()` (claims only) and `getCurrentCustomer()` (`profiles` row → `CustomerProfile`). Tolerates the BE-002 table and the #344 columns. |

Profile photos are in Supabase Storage (`modules/session/avatar-storage.ts`): private `avatars` bucket, key `avatars/<userId>/<uuid>.<ext>` in `profiles.avatarKey`, uploaded/deleted as the signed-in user (Storage RLS, own folder only), shown via 1-hour signed URLs. Schema: `supabase/migrations/20261001130000_profile_avatar_storage.sql` (the avatar slice of #344, idempotent; #344 was made tolerant of it).

Hosted project state (updated 2026-10-02, WIRE-E00 hosted catch-up): `on_auth_user_created` → `app_private.handle_new_user` now exists on `xydundrayuusqizssgby` (created by `20261001090100_be344_extend_profile_identity`) and fires on every sign-up, writing the `profiles` row — including the #344 identity columns, `referralCode`, and share-attribution fields — directly. The `ensureProfileRow` / `saveProfileFields` first-write fallback in `apps/web` is no longer load-bearing for row creation; it still runs harmlessly (`ON CONFLICT (id) DO NOTHING`) as a safety net. `20261001130000_profile_avatar_storage` and `20261001140000_profiles_self_policies` were applied through the Supabase connector; all other migrations are reconciled through `prisma migrate resolve`/`deploy` (`docs/backend/migrations.md`).

Bookings, packages, onboarding answers and policy acceptances are still mocked: the signed-in profile is mirrored into `MockDataAdapter.ensureCustomer` under the Supabase user id, so a new account starts with no bookings. Profile name/contact/roster/onboarding timestamps are written to `profiles` (falling back to `fullName` / `contactNumber` until #344 is applied). Google sign-ups cannot carry share attribution (no metadata on OAuth); email sign-ups pass `ref` / `ref_channel`.

## Customer directory membership (2026-10-03)

Auth/profile existence is not customer registration: staff provisioning also creates
these rows. `profiles.customerRegisteredAt` records customer portal registration.
The validated email sign-up and Google completion action in `apps/web` send
`registration_source: "customer_portal"` alongside the required `contact_number`.
The private `mark_customer_registration` Auth trigger stamps the profile once;
its name sorts after `on_auth_user_created` so email sign-up already has a profile.
Google's initial OAuth exchange alone does not mark a registration. Staff invites,
password resets, and ordinary phone edits do not create membership; dual
customer/staff accounts keep their membership even if their role changes.

`GET /api/admin/customers` applies `customerRegisteredAt IS NOT NULL` before all
filters, counts, and pagination. Customer detail applies the same condition and
returns 404 for staff-only profiles. Permissions and ownership checks are unchanged:
this metadata is **classification, never authorization**. The trigger has no public
RPC or customer EXECUTE grant, uses a fixed search path, and only updates `NEW.id`.
The timestamp is not in customer-writable column grants.

The additive migration backfills existing registrations once from nonblank Auth
`contact_number` metadata plus the saved profile contact number (the historical
customer sign-up contract). Legacy timestamps use profile creation time, not an
asserted exact completion time. No staff-role exclusion is used. Customer demo
seeds explicitly mark membership; staff seeds do not. New writers must send the
explicit marker rather than relying on a phone-number heuristic.

## Sign-up metadata (#344)

`handle_new_user` reads `raw_user_meta_data` (client `options.data` on sign-up; Google fills `given_name` / `family_name` / `full_name` / `name`). Keys:

| Key | Use |
| --- | --- |
| `first_name` | `firstName`. Fallbacks, in order: `given_name` (Google), first token of `full_name` / `name`, email local part, `'Member'`. |
| `last_name` | `lastName`. Fallbacks: `family_name`, remainder of `full_name` / `name` after the first space, `''`. |
| `contact_number` | `contactNumber` (default `''`). |
| `ref` | Another profile's `referralCode` (case-insensitive). Sets `referredById`. |
| `ref_channel` | `CUSTOMER_LINK` / `CUSTOMER_QR` / `STUDIO_LINK` / `STUDIO_QR`. Ignored unless it is a valid `referral_channel`. |

The trigger also gets `referralCode` from the column default (`app_private.generate_referral_code()`: 8 chars Crockford base32, random, not derived from email or id) and `fullName` from the sync trigger (deprecated, derived).

Attribution rules (last touch is decided by the client, which keeps the 30-day share cookie):

- A `ref` that matches another profile's code sets `referredById` and `referralChannel` (`CUSTOMER_LINK` / `CUSTOMER_QR` from `ref_channel`; anything else defaults to `CUSTOMER_LINK`).
- Unknown codes, self-referral, and codes that belong to a **staff-only** profile (a `staff_members` row and no bookings) are ignored.
- Without a valid `ref`, only `STUDIO_LINK` / `STUDIO_QR` are kept (studio links carry no code). `CUSTOMER_*` without a valid `ref` is dropped.
- Attribution errors are swallowed. Sign-up never fails because of `ref` / `ref_channel`. `ON CONFLICT (id) DO NOTHING` is unchanged.

`referralCode`, `referredById` and `referralChannel` are not customer-writable afterwards (column grants, see [rls-policies.md](./rls-policies.md)). Do not use `user_metadata` for authorization; these keys are attribution only.

## Providers

| Provider | Customer (`apps/web` :9000) | Admin (`apps/admin` :9001) |
| --- | --- | --- |
| Google OAuth | Yes | Sign-in only if the user is already a provisioned staff account |
| Email / password | Yes | Yes — **no** public sign-up, **no** forgot-password page (`admin/01-login.md`) |

## Human dashboard runbook (required once)

These clicks cannot be completed from the repo without Google Cloud OAuth client secrets (do not invent them).

1. Dashboard → **Authentication → Providers**
   - Enable **Email**. Confirm “Confirm email” matches the product decision (MVP: keep confirmation on unless Rex asks otherwise).
   - Enable **Google**. Paste the Google Cloud OAuth **Client ID** and **Client secret** from the GCP project that owns `*.supabase.co` / future production origins. Authorized JavaScript origins and redirect URIs in GCP must include the Supabase callback: `https://xydundrayuusqizssgby.supabase.co/auth/v1/callback`.
2. Dashboard → **Authentication → URL configuration**
   - Site URL (dev): `http://localhost:9000`
   - Additional redirect URLs (allowlist):

     ```
     http://localhost:9000/**
     http://localhost:9001/**
     http://localhost:9000/auth/callback
     http://localhost:9000/auth/reset
     http://localhost:9001/auth/callback
     https://*.vercel.app/**
     ```

     After Vercel projects exist, add the stable production / staging origins explicitly (wildcards are a convenience for previews).
3. Dashboard → **Authentication → Emails**
   - Confirm the password-reset template. Redirect used by `customer/03-forgot-password.md`: `{NEXT_PUBLIC_SITE_URL}/auth/reset` on the **customer** app only.

## Scratch verification (after the runbook)

From a throwaway client (Supabase JS in a Node script or the Dashboard Auth user list):

1. Email/password sign-up + sign-in against the customer redirect.
2. Google sign-in against the same redirect.
3. Trigger “forgot password” for a test customer and confirm the email link lands on `/auth/reset` (not the admin origin).
4. Confirm there is **no** `/sign-up` or `/forgot-password` route on `apps/admin`.

Until Google client secrets are pasted, Google sign-in cannot succeed. Email/password can be enabled immediately in the dashboard.

## Admin provisioning (no self-serve)

1. An authorized staff manager adds the person in `/staff/new`. The server calls Supabase `auth.admin.generateLink({ type: "invite" })`, never `inviteUserByEmail`. A modal offers a private link to copy and share manually; **no invitation email is sent**. Existing confirmed Auth accounts retain their credentials and do not receive a password-setting link.
2. Staff access is resolved from `staff_members` and its active role/permissions, never editable user metadata. Creating invitations requires `staff.manage`; the actor cannot grant or generate an invitation for permissions they do not hold. Duplicate staff creation is rejected rather than silently overwriting access.
3. Password help: an authorized staff manager copies a link from the **Reset password** cell and shares it privately. There is no public forgot-password request form or reset email delivery.
4. Initial humans: Coach Rex and his wife [R60].

### Manually shared staff invitations (2026-10-03)

- Configure `SUPABASE_SERVICE_ROLE_KEY` in the **admin app's server environment** (`apps/admin/.env.local` locally), not a `NEXT_PUBLIC_*` variable and not only the database CLI env. Also configure `STAFF_INVITE_ORIGIN` to the admin origin, e.g. `http://localhost:9001` locally or the live admin HTTPS origin. The shared API host needs these variables too if serving staff writes from `apps/web`. Restart/redeploy after environment changes.
- `/staff` has an **Invite** cell with a direct **Copy link** button (also visible in mobile cards), not an overflow-menu action. It generates a link for a pending, active, non-system staff account through `POST /api/admin/staff/{id}/invite`; it does not reset established accounts. If clipboard permission is unavailable, a dialog offers a selectable link and a second copy attempt. Generating a replacement may invalidate the earlier link; share the latest one.
- The link opens the admin `/auth/set-password#token_hash=…` page. The token stays out of request URLs/referrers and is removed from browser history after loading; it is held only in component memory. Reloading before submission requires reopening the original link.
- Only submitting the password form verifies the single-use Supabase token (`verifyOtp`, type `invite` or `recovery`). GETs and link previews do not consume it. The server rechecks active staff and role status, then sets the password. Success signs out the temporary local session and offers sign-in. There is still no public signup or forgot-password request form.
- A short-lived, signed HttpOnly cookie binds the verified link to the Auth user, token digest and token type, allowing a password-policy or transient failure to be retried for 10 minutes without replaying the consumed token. A normal login alone cannot authorize password setup. If that retry window/session is lost, request a fresh link using the separate Reset password action, not Invite.
- Expired/used links show a clear error. Expiry is Supabase's configured email OTP expiry. Invite URLs are bearer credentials: do not log, persist in query caches, audit, or share publicly. API responses use `Cache-Control: no-store`; audit records contain only staff/actor identifiers.

### Staff password reset links (2026-10-03)

The **Reset password** cell's **Copy link** button calls `POST /api/admin/staff/{id}/reset-password`.
It applies the same actor/target-role checks as invitations and resolves the recipient from the
staff user's verified Supabase Auth record, not the editable contact email. It uses
`auth.admin.generateLink({ type: "recovery" })`, never `resetPasswordForEmail`; link generation
does not send email or change the password. The fragment contains `type=recovery`, accepted
only alongside a valid recovery token on form submission. This works for confirmed accounts
even if the staff member never chose or does not know their current password. Clipboard failure
shows a private-copy dialog. The link grants password-changing access: share only with the intended
staff member. The audit records `staff.password_reset_link_generated` without the URL or token.
Supabase's separately configured password-change security notifications are not changed by this feature.
