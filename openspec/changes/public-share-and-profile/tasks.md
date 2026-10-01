# Tasks: Public share pages, public roster, profile identity and onboarding (#343)

Waves: 1 → #344, #346 · 2 → #345, #347, #351, #353, #354 · 3 → #348, #352 · 4 → #349 · 5 → #350.

## BE lane (schema and database only, no HTTP)

### #344 — Profile identity extensions

- [ ] `Profile`: `firstName`, `lastName`, deprecated derived `fullName` (trigger), `nickname` (2–30 check), `avatarKey`, `showOnPublicRoster` (default true), `referralCode` (unique, generated + backfilled), `referredById` self relation, `referralChannel`, `onboardingCompletedAt`, `onboardingSkippedAt`, indexes.
- [ ] `ProfileOnboarding` (1:1) and `ProfileClassInterest`, `*Other` capped at 120 chars.
- [ ] Enums `FitnessGoal`, `ExperienceLevel`, `HeardFromSource`, `ReferralChannel` matching the domain option lists.
- [ ] Forward-only migration with name and referral-code backfill. No onboarding rows for existing users.
- [ ] `handle_new_user`: first/last resolution, `referralCode`, `ref` / `ref_channel` attribution that never fails sign-up.
- [ ] Private `avatars` bucket (5 MB, JPEG/PNG/WEBP), storage RLS, `PendingUpload.profileId` actor with `profile_avatar` purpose.
- [ ] RLS for profile self-update columns, onboarding owner CRUD, staff `customers.read`, coach own-students read.
- [ ] Docs under `docs/backend/` (auth, RLS, storage, uploads, enums, migrations, seed).

### #345 — Public read surface

- [ ] `app_public.public_session` and `app_public.public_event` (`PUBLISHED` / `CANCELLED` only; no `internalNotes`, `isPlaceholder` or venue notes).
- [ ] `app_public.public_session_roster`: counts for `anon`; display-only rows, `hidden_count` and own opted-out row for `authenticated`.
- [ ] Grants to `anon` / `authenticated`; index check with `EXPLAIN`.
- [ ] Docs: public read functions matrix, `session-events.md` (slug derived, no column), future `/api/public/*` contracts as not implemented.

## FE lane (mock-first, `getMockAdapter()` only)

### #346 — Foundation

- [ ] This OpenSpec change (`proposal.md`, `design.md`, `tasks.md`, deltas for `fe-public-screens`, `fe-customer-screens`, `fe-admin-screens`, `fe-shared-systems`, `events`).
- [ ] Screen specs: new `public/12-session-page.md`, `public/13-event-page.md`, `customer/16-onboarding.md`, `admin/22-marketing-insights.md`; updates to `customer/02`, `05`, `11`, `admin/04`, `12`, `18`, `20`, and `SCREEN_INDEX.md`.
- [ ] `docs/MVP-ROADMAP.md` OQ-3 row and BE-002 / FE-CUS-002 / FE-CUS-005 notes.
- [ ] `@balanse/domain`: `CustomerProfile` fields, `profile.ts`, `onboarding.ts`, `public-share.ts`, public page and roster types, extended admin DTOs, `MarketingInsights`.
- [ ] `permissions.ts`: `reports.marketing.read` (Super Admin only). `navigation.ts`: `/marketing-insights` entry, profile "About you" section.
- [ ] `UserAvatar` + `UserAvatarStack` in `@balanse/ui`.
- [ ] `MockDataAdapter` methods and fixtures (names, nicknames, placeholder avatars, opt-outs, onboarding states with `cust-ana` not started, referrals, a ≥ 8-attendee published event, a cancelled event, a past session).

### #347 — Share kit

- [ ] `ShareDialog` + `ShareButton` (copy, native share, QR SVG, QR PNG 1024², poster download, `disabledReason`, Dialog / Drawer).
- [ ] `share-card.tsx` renderer (poster 1080×1350, OG 1200×630), `/share/poster/sessions/[id]`, `/share/poster/events/[id]`, `renderOgImage`.
- [ ] `qrcode` dependency; `NEXT_PUBLIC_WEB_SITE_URL` for admin.

### #348 — Public session page

- [ ] Route, canonical 301, metadata, OG image, hero, facts, coaches, "Part of <event>" callout, booking button states, banners.
- [ ] Shared `PublicRoster` in `apps/web/src/components/balanse/public-roster/`.
- [ ] Share in hero and footer with `ref` for signed-in customers.

### #349 — Public event page

- [ ] Route, canonical 301, metadata, poster hero, about, gallery, beneficiary, what to bring, registration window, banners, reused facts / coaches / roster.

### #350 — Share entry points

- [ ] Admin: schedule selected-session panel, session roster header, event detail (`src=studio`, "Open public page", disabled reasons).
- [ ] Customer: booking detail "Invite friends" card, calendar rows and popovers, `/classes/[slug]` upcoming list ("Details" + share icon).

### #351 — Sign-up, attribution, profile

- [ ] Attribution middleware and cookie; cleared after sign-up.
- [ ] Sign-up on RHF + zod with first + last name; Google prefill; redirect to `/portal/welcome?returnTo=`; open-redirect guard.
- [ ] `AvatarUploader` (crop, validate, 512×512, remove).
- [ ] Basic profile: photo, first/last, nickname + preview, privacy switch, legacy last-name prompt; portal nav avatar.

### #352 — Onboarding

- [ ] `/portal/welcome` wizard (4 steps + done, skip, resume, finish).
- [ ] Portal-home `complete-profile-card`.
- [ ] `/portal/profile/about` reusing step forms.

### #353 — Admin and coach surfaces

- [ ] Session roster: avatar, nickname subtitle, goals/experience chips (permitted viewers), "Hidden on public roster" indicator. Rebase on the existing roster changes.
- [ ] Customers list (avatar, nickname search, onboarding filter) and detail (header, badges, `customer-about-card`, `customer-referral-card`).
- [ ] Coach Students list and detail (avatar, nickname, About card for own students; no referral).

### #354 — Marketing insights

- [ ] `/marketing-insights` gated on `reports.marketing.read`: date range, KPI row, heard-from, goals, experience, class interest, sharing charts, empty states, table fallback. Counts only.

## Closeout (#343)

- [ ] Every child AC reconciled.
- [ ] Merge the deltas in `specs/` into `openspec/specs/` and archive this change.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan` pass.
