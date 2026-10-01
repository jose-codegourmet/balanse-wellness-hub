# Supabase Auth and admin access

**INF-005.** Providers and URLs are configured on project `xydundrayuusqizssgby`. FE screens stay mock-only this phase (`WIRE-002` later). Role rows are `BE-003`.

Profile rows (`BE-002`) are created by trigger `on_auth_user_created` → `app_private.handle_new_user`. OQ-3 still forbids DOB / health / emergency contact.

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

1. An existing owner/admin creates the user in Dashboard → **Authentication → Users** (email/password) **or** sends a Supabase invite email.
2. `BE-003` will attach `staff_members` / role. Until then, treat `raw_app_metadata` (not `user_metadata`) as the only safe JWT claim for “this person is staff”.
3. Password help: the admin UI tells the user to contact the system administrator (`admin/01-login.md`). An existing admin resets the password in the Dashboard or via a future staff API — never a public reset page on `:9001`.
4. Initial humans: Coach Rex and his wife [R60].
