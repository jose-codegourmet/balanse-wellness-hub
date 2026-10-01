# Delta: Customer portal mocks

Base: `openspec/specs/fe-customer-screens.md`. Merge on archive.

## MODIFIED Requirements

- Auth screens follow `docs/screen-specs/customer/01-login.md`–`03-forgot-password.md`. **Changed:** sign-up asks for **First name** and **Last name** (both required, 1–50 chars) instead of Full name, uses React Hook Form + `zodResolver` with colocated schema and defaults, and prefills both from Google `given_name` / `family_name`. No other new sign-up fields (OQ-3).
- Portal surfaces follow `04`–`13` and `16-onboarding.md` with human-readable statuses only.

## ADDED Requirements

- `returnTo` is preserved through login, sign-up and onboarding. Only same-origin relative paths are accepted.
- Sign-up from a shared link is attributed. Middleware stores `ref` / `src` / `via` in the `balanse_share_attr` cookie (30 days, last touch). Sign-up passes it to `createCustomer({ firstName, lastName, email, contactNumber, attribution })` and clears the cookie. See `openspec/changes/public-share-and-profile/design.md` §3.
- After sign-up (email or Google) the customer lands on `/portal/welcome?returnTo=…`. Login never forces the wizard.
- Onboarding wizard at `/portal/welcome`: You → Goals & experience → Interests → How you heard about us → Done. "Skip for now" on every step. Continue saves partial answers. Re-entry resumes at the first incomplete step; a completed customer is redirected to `returnTo`. Option lists are fixed in `@balanse/domain`. No DOB, health, injury or emergency-contact questions (OQ-3).
- Portal home shows a non-dismissible **Complete your profile** card until onboarding is completed, below the next-booking card.
- Profile basic section edits photo (circular crop, 512×512, JPG/PNG/WEBP up to 5 MB, remove → initials), first and last name, optional nickname (2–30 chars) with a "Other members will see you as …" preview, email and contact number. A **Privacy** sub-section has the switch **Show me on class rosters** (default on), saved immediately.
- Profile **About you** at `/portal/profile/about` edits goals, experience, interests and heard-from with the wizard's step forms. Copy says the answers are visible to the customer, their coaches and studio staff, never to other members.
- Booking detail shows an **Invite friends** card for upcoming `CONFIRMED`, `HELD_AWAITING_PAYMENT` and `PAYMENT_SUBMITTED` bookings. It shares the session URL (or the event URL when the session has a published event) with the customer's `ref`. Hidden for cancelled, rejected, expired and past bookings.
- The portal header avatar uses `UserAvatar` (photo or initials).
- Data comes from `getMockAdapter()` (`patchMe`, `setMyAvatar`, `getMyOnboarding`, `saveMyOnboarding`, `completeOnboarding`, `skipOnboarding`, `createCustomer`). Do not fetch `/api/*`.
