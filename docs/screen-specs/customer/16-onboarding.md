# Customer Portal — Onboarding (#352)

**Route:** `/portal/welcome?returnTo=<safe path>`  
**Audience:** Signed-in customers. Shown after sign-up; skippable.

```text
WELCOME                                   Step 2 of 4   [Skip for now]

1 YOU            Photo (optional) · First name · Last name · Nickname
                 "Other members will see you as Annie"
2 GOALS          [Strength] [Flexibility & mobility] [Weight management]
                 [Stress relief] [Posture & core] [Endurance] [Community] [Other…]
                 Experience: ( ) New  ( ) Some  ( ) Regular  ( ) Advanced
3 INTERESTS      Active class cards (multi, optional) · Other…
4 HEARD FROM     ( ) Friend ( ) Instagram ( ) Facebook ( ) TikTok ( ) Google
                 ( ) Event ( ) Walk-in ( ) Other…
DONE             You're all set, Annie!
                 [Back to Reformer Pilates]  or  [Browse the schedule]
                 [Go to my portal]

                                        [Back]  [Continue]
```

## Entry and exit

- Sign-up (email and Google) redirects here. Login never does; existing users reach it from the portal-home card or profile.
- `completed` → redirect to `returnTo` or `/portal`. `skipped` / `in_progress` resume at the first incomplete step (`firstIncompleteOnboardingStep`); if every step is answered but Finish was never pressed, it opens on the last step.
- **Skip for now** (wizard header, visible on every step) → `skipOnboarding` → `returnTo`. Saved answers are kept.
- **Continue** saves the step (`saveMyOnboarding`, partial). **Back** keeps unsaved edits in memory.
- **Finish** → `completeOnboarding` → Done. Primary CTA "Back to <page>" when `returnTo` is a public session or event page, otherwise "Browse the schedule" → `/book/calendar`. Secondary "Go to my portal".
- `returnTo` must be a same-origin relative path.

## Steps

1. **You:** `AvatarUploader` (optional), first and last name (required; fixes empty last names from the backfill), nickname (optional, 2–30 chars) with the display-name preview. Saves via `patchMe`.
2. **Goals & experience:** goals multi-select, at least one; "Other" reveals text (≤ 120 chars). Experience single choice as option rows with descriptions.
3. **Interests:** active classes (name + thumbnail), optional; "Other" text (≤ 120 chars) for classes the studio doesn't offer yet.
4. **How did you hear about us?** single choice; "Other" reveals text. Prefilled from share attribution: friend's link or QR → Friend; studio QR → Event; studio link → no prefill. When referred by a customer: "Looks like a friend shared a class with you 👋". Never name the referrer.
5. **Done.**

Each step explains why we ask (for example "Helps your coaches tailor the class"). Option lists are fixed in `@balanse/domain`. No DOB, health, injury or emergency-contact questions (OQ-3).

## Portal-home nudge

**Complete your profile** card on `/portal` until onboarding is completed: progress ("2 of 4 done"), missing items ("Add a photo", "Tell us your goals"), **Continue** → `/portal/welcome?returnTo=/portal`. Not dismissible. It sits below the next-booking card and must not push it below the fold on mobile.

## About you (profile)

`/portal/profile/about` reuses the goals, interests and heard-from step forms, each with its own Save, "Last updated", and a link to the wizard when not completed. Copy: "Visible to you, your coaches and studio staff. Never shown to other members."

## States

Each step empty, filled, validation error, "Other" expanded; full wizard desktop and mobile; done with and without a shared-link `returnTo`; nudge not started, in progress, skipped. Keyboard: chips and option rows reachable, Enter continues, focus moves to the step heading.

Mock data: `getMyOnboarding`, `saveMyOnboarding`, `completeOnboarding`, `skipOnboarding`, `patchMe`, `setMyAvatar`, `getPublicClasses`. No `/api/*`.
