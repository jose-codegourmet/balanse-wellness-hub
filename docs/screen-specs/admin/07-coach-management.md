# Admin Portal — Coach Management

```text
COACHES                              [Add Coach]
Coach Rex | Boxing/Wellness | Active | View
Coach ___ | Yoga             | Active | View
```

Detail: name, specialty/classes, public bio, photo/reference, active/inactive, upcoming assigned sessions. No coach schedule editing.

## Internal financial fields

Coach detail should also support internal rate data:

```text
Default Rate
Rate Type
```

Possible rate types:

- Per Session
- Per Hour

These fields are admin-only.

Admin coach payloads also include optional `staffId` (BE-055): the linked staff account, if any. Public coach cards must not show it. Coach detail shows a staff-link row on the public-profile tab (`linked account` or `not linked to a staff account`). Coach-only people (no staff login) stay valid. See `docs/backend/staff-coach-unification.md`.

Do not show coach compensation on:

- public Coaches page,
- public landing page,
- customer schedule,
- customer booking confirmation.

## Rough detail addition

```text
Coach Rex

Specialty: Boxing / Wellness
Status: Active

INTERNAL
Default Rate: ₱___
Rate Type: Per Session

Upcoming Sessions
[session list]
```

## Profile photo management

The coach form must include a real image-management field.

### Controls

```text
PROFILE PHOTO

[Current image preview]

[Upload Photo]
[Replace Photo]
[Remove Photo]
```

### Suggested full edit layout

```text
┌────────────────────────────────────────────────────────────┐
│ EDIT COACH                                                  │
├────────────────────────────────────────────────────────────┤
│ PROFILE PHOTO                                               │
│ [image preview]                                             │
│ [Upload/Replace] [Remove]                                   │
├────────────────────────────────────────────────────────────┤
│ PUBLIC PROFILE                                              │
│ Name                                                        │
│ Specialty / Classes                                         │
│ Short Bio                                                   │
│ Status: Active / Inactive                                   │
├────────────────────────────────────────────────────────────┤
│ INTERNAL FINANCIALS                                         │
│ Default Rate                                                │
│ Rate Type: Per Session / Per Hour                           │
├────────────────────────────────────────────────────────────┤
│ [Save Changes]                                              │
└────────────────────────────────────────────────────────────┘
```

## Photo behavior

- Accept one primary profile photo per coach.
- Show a preview before saving when possible.
- Allow replacement without creating duplicate active profile photos.
- Allow removal.
- Public pages should use the current saved coach photo.
- If no photo exists, use a deliberate fallback/avatar state rather than a broken image.

## Privacy

Coach photo, name, specialty, and public bio are public-facing.

Coach rate and rate type are admin-only.
