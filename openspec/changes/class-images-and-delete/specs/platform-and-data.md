# Delta: Platform and data access

Base: `openspec/specs/platform-and-data.md` (requirements 1–9). Merge on archive.

## MODIFIED Requirements

6. Storage separates public marketing assets from private payment proofs and avatars. Signed upload intents bind actor, target, purpose, type and size; confirmation verifies the object. **Upload purposes are `coach_photo`, `gcash_qr`, `event_image` and `class_image`; a class image intent has no target id because it is minted before the class exists, and its key must match `marketing-assets/classes/<uuid>.<ext>`.** Private reads use short-lived signed URLs. An orphan cleanup job reaps unconfirmed intents; hold expiry and waitlist promotion jobs preserve booking invariants.
