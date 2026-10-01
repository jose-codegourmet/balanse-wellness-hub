# Customer Portal — Profile

```text
PROFILE
Photo            (avatar) [Upload photo / Change photo] [Remove]
First name       Last name
Nickname         "Shown to other members on class rosters instead of your first name."
                 Other members will see you as (avatar) Annie
Email
Contact number
[Save]

PRIVACY
[on] Show me on class rosters
     When off, you're counted as going but your name and photo are hidden
     from other members. Coaches and studio staff can still see you.

ABOUT YOU  (/portal/profile/about)
Goals · Experience · Interests · How you heard about us

ACCOUNT
Auth method
Change password (when applicable)
[Log out] → confirm, then return to login

POLICY / WAIVER HISTORY
Accepted versions summary
```

Profile data pre-fills booking forms.

## Identity, photo and privacy (#343, #351)

- **Photo:** `AvatarUploader`, saved separately from the form. JPG/PNG/WEBP up to 5 MB, camera or library, circular crop with zoom (1–3×) and drag, saved 512×512. Errors: "Use a JPG, PNG or WEBP image", "Photo must be 5 MB or smaller". **Remove** confirms, then falls back to initials on a brand-palette tone.
- **First name** and **Last name** are required. A single-word legacy name (empty last name) shows "Add your last name to complete your profile."
- **Nickname** is optional, 2–30 chars, trimmed. The preview uses the display-name rule (nickname, else first name). The last name is never shown to other members.
- **Show me on class rosters** (`showOnPublicRoster`, default on) saves immediately with a toast; optimistic with rollback.
- Save → `patchMe` (`firstName`, `lastName`, `nickname`, `email`, `contactNumber`, `showOnPublicRoster`). Booking prefill keeps working.
- The portal header avatar shows the photo or initials.

## About you (#352)

`/portal/profile/about` is a profile section (nav "About you"). It edits goals, experience, interests and heard-from with the onboarding step forms, each with its own Save and "Last updated", and links to the wizard if onboarding is not completed. Copy: "Visible to you, your coaches and studio staff. Never shown to other members." No DOB, health or emergency-contact fields (OQ-3). See `16-onboarding.md`.
