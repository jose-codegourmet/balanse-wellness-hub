# Change: Public share pages, public roster, profile identity and onboarding (#343)

## Why

Marketing and customers want to share one session or event by link or QR. Today the only per-session URL is `/portal/book/[sessionId]` (login required), events have no public surface, the roster exists only in admin, and `Profile` holds only `fullName`, email and contact number. There is nothing friendly or privacy-safe to show on a public roster, and no way to learn why people sign up.

Epic #343 (Q&A with Jose, 2026-10-01) is the product contract. Its §2 rules are authoritative; §8 defaults are applied.

## What

- Public session page `/sessions/<class-slug>/<YYYY-MM-DD>/<sessionId>` and public event page `/events/<event-title-slug>/<YYYY-MM-DD>/<eventId>` in `apps/web`. The id is authoritative; a stale slug or date 301s to the canonical URL with the query string kept.
- A privacy-safe "Who's going" block: counts for guests, display names and avatars for signed-in customers, opt-outs counted but not listed.
- A share kit (copy link, native share, on-screen QR, QR PNG, poster card) on the public pages, admin session and event detail, customer booking detail ("Invite friends"), `/book/calendar` rows and the `/classes/[slug]` upcoming list.
- Light referral attribution: `ref` / `src` / `via` → 30-day last-touch cookie → stored on the new profile at sign-up. No rewards.
- Profile identity: first + last name (replacing the single full-name field), optional nickname, avatar with circular crop, "Show me on class rosters" toggle.
- A skippable onboarding wizard at `/portal/welcome` (you → goals → interests → heard-from → done), a portal-home "Complete your profile" card and a profile "About you" section.
- Admin and coach surfaces show avatar, nickname, onboarding answers and referral info. A new Super-Admin-only marketing insights report (`/marketing-insights`, `reports.marketing.read`) shows aggregate counts only.
- Amends `events.md`: events now have a public page. The event slug is derived from the title at render time and never stored.

## Decisions

- Two separate public pages. A session with a published or cancelled event links to the event page ("Part of …").
- Attendees are `CONFIRMED` and `CHECKED_IN` bookings only. Display name is `nickname`, else `firstName`. The last name is never public.
- The public roster DTO never carries last name, email, contact number, profile id, booking id, booking/payment status or booking time.
- `showOnPublicRoster` defaults on. Opt-out is enforced in the database (#345) and in `MockDataAdapter`, never only in a component.
- Avatars live in a private bucket and are served through short-lived signed URLs.
- Onboarding option lists are fixed in `@balanse/domain`. OQ-3 still stands: no DOB, health, injury or emergency-contact fields, and no medical goal options.
- `fullName` stays as a deprecated derived field (`firstName + " " + lastName`). Dropping it is a follow-up.
- §8 defaults: names backfilled by splitting on the first space; poster built from `@balanse/config` tokens; the event registration window gates the event booking button on top of the canonical cutoff; cancelled and past pages are `noindex`; insights show counts only; `reports.marketing.read` is Super Admin only; attribution is last touch within 30 days with self-referral ignored.

## Tickets

BE #344, #345. FE #346 (this foundation), #347–#354. See `tasks.md`.

## Out of scope

`@balanse/api` handlers and FE↔BE wiring (screens stay on `getMockAdapter()`), referral rewards or notifications, public customer profiles or social features, listing held/payment-submitted/waitlisted bookings publicly, admin-managed option lists, DOB/health/emergency contact (OQ-3), share click/scan analytics, dropping `fullName`, a public `/events` index, multi-session events.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`
- Prisma validate/generate and a clean migration apply (#344, #345)
- Manual browser QA with guest and customer mock principals (pages), and Super Admin / Front Desk / Coach principals (admin)
