# Design: Public share pages, public roster, profile identity and onboarding

Source of truth: epic #343 §2. Shared contracts (types, URL builders, option lists, display-name rule) live in `@balanse/domain` (#346). Child tickets consume them; they do not redefine them.

## 1. URL scheme and canonical redirect

| Page | Route (`apps/web`) | Canonical path |
| --- | --- | --- |
| Session | `(public)/sessions/[classSlug]/[date]/[sessionId]` | `/sessions/<GymClass.slug>/<YYYY-MM-DD>/<sessionId>` |
| Event | `(public)/events/[eventSlug]/[date]/[eventId]` | `/events/<slugify(SessionEvent.title)>/<YYYY-MM-DD>/<eventId>` |
| Session poster | `share/poster/sessions/[sessionId]` | GET image, 1080×1350 |
| Event poster | `share/poster/events/[eventId]` | GET image, 1080×1350 |

- `<YYYY-MM-DD>` is the session start date in `Asia/Manila` (`toManilaDateSegment`). The event uses its session's start.
- The id is authoritative. The slug and date segments are cosmetic.
- The event slug is derived from the title at render time (`slugify`: ASCII, lowercase, hyphenated, max 60 chars, fallback `event`). There is no slug column.
- Resolution: load by id → `null` → `notFound()`. Otherwise build the canonical path with `buildPublicSessionPath` / `buildPublicEventPath`. If the requested slug or date differs, `permanentRedirect` (301) to the canonical path with the original query string (`ref`, `src`, `via`, anything else) unchanged.
- Admin `/events/[eventId]` lives in `apps/admin` (9001). The public event route lives in `apps/web` (9000), so the two never collide. `apps/web` has no `/events` index in this change.
- Admin builds absolute public URLs from `NEXT_PUBLIC_WEB_SITE_URL` (fallback `http://localhost:9000`). `apps/web` uses `NEXT_PUBLIC_SITE_URL`.

### Visibility by status

| State | Page | Booking button | Roster | Share | Indexing |
| --- | --- | --- | --- | --- | --- |
| Session `DRAFT`; event `DRAFT` or `ARCHIVED` | 404 | — | — | Admin share disabled with reason | — |
| Published, upcoming | Renders | Per `public-cta.ts` (book / waitlist / past cutoff / "View my booking"). Event: registration window on top | Per viewer matrix | Link, QR, poster | Indexable |
| Session or event `CANCELLED` | Renders with **Cancelled** banner | None | Muted, "This session was cancelled." | Link and QR only; poster download hidden | `noindex` |
| Past | Renders with **"This session has ended"** / **"This event has ended"** | None | Per viewer matrix | Link and QR only; poster route 404s | `noindex` |

- Event effective status is `CANCELLED` when its session is cancelled (`events.md` R3).
- Event pages never render `internalNotes` or `isPlaceholder`. Neither page renders venue `notes`.

## 2. Roster visibility matrix

Attendees = bookings in `CONFIRMED` or `CHECKED_IN`. Held, payment-submitted and waitlisted bookings are never listed. **Going** includes opted-out attendees. **Spots left** = existing `remainingSlots` (held bookings still consume capacity).

| Viewer | Coaches | Going / spots | Attendee rows | Opted-out others | Self |
| --- | --- | --- | --- | --- | --- |
| Guest (signed out) | Photo, name, specialties | "X going · Y spots left" | None. Neutral placeholder circles + **Sign in to see who's going** (`/login?returnTo=<path+query>`) and **Create an account** | Counted only | — |
| Signed-in customer (booked or not) | Same | "Who's going (X)" | `UserAvatar` + display name for every attendee with `showOnPublicRoster = true` | Counted, shown as one **+N others** chip | First row, **You** badge |
| Signed-in customer, self opted out | Same | Same | Same | Same (self excluded from N) | First row, **You** badge + "Only you can see this — you're hidden from others" + link to `/portal/profile` |
| Staff (admin app) | — | — | Uses the admin roster (`/sessions/[sessionId]/roster`) with full data, avatar, nickname subtitle, answers (if permitted) and a "Hidden on public roster" indicator | Listed with indicator | — |

- Display name = `nickname` (trimmed, non-empty) else `firstName`. Never the last name.
- `PublicRoster` is a discriminated union: `{ visibility: "counts"; goingCount; spotsLeft }` or `{ visibility: "list"; goingCount; spotsLeft; hiddenCount; attendees }`.
- `PublicRosterAttendee` = `{ key, displayName, avatarUrl | null, initials, isSelf, hiddenFromOthers? }`. `key` is opaque (hash of booking id + session id). No last name, email, contact number, profile id, booking id, status or booking time.
- Ordering follows check-in / reservation time ascending; the timestamps are not returned.
- Opted-out attendees' avatar keys are never returned to other viewers, so no signed URL is ever minted for them.
- Enforcement: database function `app_public.public_session_roster` (#345); in the mock phase `MockDataAdapter.getPublicRoster(sessionId, viewer)` mirrors it. Mock viewer = `{ customerId }` for a customer principal, otherwise `null`.
- Attendees are not links and have no hover cards.

## 3. Attribution flow

```text
share link ──► visitor lands on any public route ──► middleware writes cookie ──► sign-up ──► profile
?ref=<code>     (pages still read params;              balanse_share_attr          createCustomer   referredById
&src=customer   query string never stripped)            {ref?, src?, via?, at}     ({..., attribution}) referralChannel
&via=qr                                                 HttpOnly, SameSite=Lax,                     heard-from prefill
                                                        30 days, last touch wins    cookie cleared
```

| Who shares | Params | QR adds | Channel at sign-up |
| --- | --- | --- | --- |
| Signed-in customer | `ref=<referralCode>&src=customer` | `via=qr` | `CUSTOMER_LINK` / `CUSTOMER_QR` |
| Admin (studio) | `src=studio` | `via=qr` | `STUDIO_LINK` / `STUDIO_QR` |
| Guest | none | `via=qr` (no channel) | none |

- `withShareParams(url, { ref?, src?, via? })` builds share URLs. `via=link` is the default and is omitted. `ShareDialog` derives the QR URL by adding `via=qr`. `toReferralChannel({ src, via })` maps to the channel; a resolved `ref` implies a customer channel.
- Cookie validation: `ref` matches `[A-Za-z0-9]{6,16}`, `src` ∈ `customer | studio`, `via` ∈ `link | qr`. Invalid values are dropped silently. A newer valid touch replaces the cookie (last touch, 30 days).
- At sign-up the server reads the cookie and passes `attribution` to `createCustomer` (mock) / auth metadata `ref`, `ref_channel` (DB trigger, #344).
- `ref` resolves against `Profile.referralCode`. Unknown codes, self-referral and staff-only profiles are ignored. `CUSTOMER_*` is stored only with a resolved referrer. `STUDIO_*` needs no `ref`. Attribution never fails sign-up.
- `referralCode`, `referredById` and `referralChannel` are not customer-writable.
- Heard-from prefill in onboarding: `CUSTOMER_LINK` / `CUSTOMER_QR` → `FRIEND`; `STUDIO_QR` → `EVENT`; `STUDIO_LINK` → no prefill. The referrer's name is never shown to the new customer.
- No click or scan analytics. Only sign-up attribution is recorded.

## 4. Onboarding flow

```text
sign-up (email or Google) ──► /portal/welcome?returnTo=<safe path>
   you ──► goals ──► interests ──► heard-from ──► done ──► returnTo (or /book/calendar)
    │        │           │              │
    └────────┴─ "Skip for now" on every step ──► skipOnboarding ──► returnTo
login ──► never forced into the wizard; portal home shows "Complete your profile"
```

- Steps (`ONBOARDING_STEPS`): `you`, `goals`, `interests`, `heard-from`, `done`. The indicator reads "Step n of 4" (done is not counted).
- **You:** avatar (optional), first + last name (required), nickname (optional, 2–30). Saves via `patchMe`.
- **Goals & experience:** goals multi (≥ 1) from `STRENGTH`, `FLEXIBILITY_MOBILITY`, `WEIGHT_MANAGEMENT`, `STRESS_RELIEF`, `POSTURE_CORE`, `ENDURANCE`, `COMMUNITY`, `OTHER`; experience single from `NEW`, `SOME`, `REGULAR`, `ADVANCED`.
- **Interests:** active classes (multi, optional) + "Other" text.
- **Heard from:** single from `FRIEND`, `INSTAGRAM`, `FACEBOOK`, `TIKTOK`, `GOOGLE`, `EVENT`, `WALK_IN`, `OTHER`; prefilled from attribution.
- Every "Other" reveals free text, max 120 chars.
- Continue saves the partial answers (`saveMyOnboarding`), so progress persists. Back keeps unsaved edits in memory.
- `onboardingStatus` derivation: `onboardingCompletedAt` set → `completed`; else `onboardingSkippedAt` set → `skipped`; else an onboarding row exists → `in_progress`; else `not_started`. A missing row means "not started"; existing users get no row on backfill.
- `/portal/welcome` when `completed` → redirect to `returnTo` or `/portal`. `skipped` / `in_progress` re-enter at the first incomplete step.
- `returnTo` must be a same-origin relative path (shared open-redirect guard). A visitor who arrived from a shared link lands back on that page with the roster now visible.
- Portal home shows a non-dismissible **Complete your profile** card (progress "n of 4 done", missing items, Continue → `/portal/welcome?returnTo=/portal`) until completed.
- `/portal/profile/about` ("About you") reuses the goals, interests and heard-from step forms. Copy: "Visible to you, your coaches and studio staff. Never shown to other members."
- Who sees answers: the customer; admin with `customers.read`; coaches for their own students only; `/marketing-insights` as aggregate counts. Never public, never customer-to-customer.

## 5. Avatar pipeline

```text
pick (camera / library) ──► validate MIME + size ──► circular crop (zoom 1–3×, drag, keyboard)
   ──► canvas 512×512 WEBP (JPEG fallback, EXIF-corrected, white behind transparency)
   ──► mock: setMyAvatar(customerId, { dataUrl })          (this phase)
   ──► BE:   signed upload → confirm (PendingUpload, purpose "profile_avatar")
             → avatars/<profileId>/<cuid>.webp → Profile.avatarKey   (later wiring)
read ──► server mints short-lived signed URL (≈10 min) ──► UserAvatar
remove ──► confirm ──► setMyAvatar(customerId, null) ──► initials
```

- Accepted: `image/jpeg`, `image/png`, `image/webp` (`AVATAR_MIME_TYPES`), up to 5 MB (`AVATAR_MAX_BYTES`). Output 512×512 (`AVATAR_OUTPUT_SIZE`). Errors: "Use a JPG, PNG or WEBP image", "Photo must be 5 MB or smaller".
- Bucket `avatars` is private: owner writes under its own prefix, staff with `customers.read` read, no anon and no customer-to-customer read.
- Fallback: `getInitials({ firstName, lastName })` (up to 2 letters, safe for an empty last name) on `avatarToneFor(seed)`, a deterministic brand-palette background from `@balanse/config`.
- `UserAvatar` (`@balanse/ui`) wraps `Avatar` / `AvatarImage` / `AvatarFallback`; a broken image URL falls back to initials. `UserAvatarStack` renders overlapping avatars with a "+N" chip.
- Mock fixtures use abstract or illustrated placeholder images, never photos of real people.
- Coach photos keep their existing handling (`CoachAvatar`); this change does not refactor them.

## 6. Data access this phase

- Screens use `getMockAdapter()` only: `getPublicSessionPage`, `getPublicEventPage`, `getPublicRoster`, widened `patchMe`, `setMyAvatar`, `getMyOnboarding`, `saveMyOnboarding`, `completeOnboarding`, `skipOnboarding`, `createCustomer` with `attribution`, `getAdminMarketingInsights`, and extended admin roster / customer / coach-student DTOs.
- Admin-facing authorization lives in `apply-admin-authorization.ts`: onboarding answers need `customers.read` or the coach-own-students scope; referral needs `customers.read`; insights need `reports.marketing.read`.
- The database surface (#344, #345) is built in parallel and not wired: `app_public.public_session`, `app_public.public_event`, `app_public.public_session_roster`. Future HTTP contracts (`GET /api/public/sessions/{id}`, `/events/{id}`, `/sessions/{id}/roster`) are documented, not implemented.

## 7. Reconciled ticket differences

- **Cancelled share.** #348/#349 say share shows `disabledReason`; #350 allows the link and disables the poster; #347 draws a "Cancelled" ribbon. Applied: on cancelled pages and admin cancelled rows the link and QR stay shareable (the page explains the cancellation) and poster download is hidden. The renderer's ribbon applies to the OG image.
- **Customer `src`.** #348 adds only `ref`; #350 adds `ref` + `src=customer`. Applied: customer links carry both. A resolved `ref` alone still maps to a customer channel.
- **Past bookings.** Attendees are `CONFIRMED` / `CHECKED_IN` only (epic §2.2). After a session ends, bookings that move to `COMPLETED` or `NO_SHOW` drop out of "going". Kept as specified; revisit if past rosters look empty.
