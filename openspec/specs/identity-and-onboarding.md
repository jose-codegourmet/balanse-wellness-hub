# Spec: Identity and onboarding

## Requirements

1. Guests may browse public availability. A customer must authenticate before reserving, and a booking belongs to the authenticated account owner. Customer sessions come from Supabase Auth, with email/password and Google entry points in `apps/web`; the portal preserves a safe same-origin `returnTo` path.
2. Customer registration asks for first name, last name, contact number and the needed credentials. The profile keeps optional nickname, avatar and roster visibility. `fullName` is a deprecated derived value; customer edits write first and last name. Customer directory membership is marked by `customerRegisteredAt`, not inferred from an Auth or staff row.
3. Customer profile pages support account details, password, policy acceptances, roster visibility and an About you section. The avatar is private and displayed through a signed read URL; missing or broken images fall back to initials. A customer can update only their own profile and onboarding answers.
4. The skippable welcome flow records goals, experience, class interests and heard-from data from fixed domain option lists. Partial progress can be resumed; completion is distinct from skip. It does not ask for date of birth, medical, injury or emergency-contact data. The portal surfaces an incomplete-profile prompt until completion.
5. A shared link may carry `ref`, `src` and `via`. Last-touch attribution within 30 days is captured during sign-up, ignores self or invalid referrals, and creates no reward. Customers cannot later edit their referral code or attribution. Admin marketing insights are aggregate only.
6. Staff access uses an active staff row and role permissions, never customer status or editable Auth metadata. The admin app has no public sign-up or forgot-password page. Authorized staff managers create staff records and manually copy invite or recovery links; link generation sends no email. Link tokens are single-use and never enter audit metadata or persistent UI caches.
7. The staff profile avatar is private and separate from the public coach portrait. Staff managers can edit eligible staff avatars; any active interactive staff member can manage their own avatar at `/my-profile`. A staff member may also be a registered customer without losing either identity.
8. The built-in Coach role's `/students/**` view derives the linked coach from the verified staff actor and includes only students in that coach's sessions. Onboarding data is scoped to those students; referral data stays outside the coach view. Role matrices and last-Super-Admin protection are defined in [staff roles and permissions](staff-roles-and-permissions.md).

## Scenarios

- **Staff-only profile:** Given an invited staff account with an Auth/profile row but no `customerRegisteredAt`, when an actor searches the customer directory, that account is absent and customer detail returns not found.
- **Guest booking:** Given a guest on a selected public session, when they choose Reserve, sign-in carries that session in a validated `returnTo` path.
- **Dual identity:** Given a registered customer who later joins staff, when the staff role changes, the customer registration marker and their own booking history remain.

## Surfaces and sources

- Customer: `/login`, `/sign-up`, `/forgot-password`, `/portal/welcome`, `/portal/profile/**`; `/api/me`, `/api/me/onboarding`, `/api/me/avatar`.
- Staff: `/login`, `/auth/set-password`, `/staff/**`, `/my-profile`, `/students/**`; `/api/admin/staff`, `/api/admin/me`, `/api/admin/coach/students`.
- Detail: `docs/business-requirements/04-auth-and-profile.md`, `docs/backend/auth.md`, `docs/backend/uploads.md`, `docs/screen-specs/customer/16-onboarding.md`.
