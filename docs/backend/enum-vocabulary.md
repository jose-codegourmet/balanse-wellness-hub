# Enum vocabulary (BE-001)

Canonical TypeScript module: `@balanse/domain` (`packages/domain/src/enums.ts`).
Prisma re-export: `@balanse/db` (`packages/db/src/enums.ts`).

Customer-facing booking/refund labels: `docs/screen-specs/shared/02-status-language.md`.

## Maps 1:1 to status-language.md

`WAITLISTED`, `HELD_AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`, `CONFIRMED`, `CANCELLATION_REQUESTED`, `RESCHEDULE_REQUESTED`, `CANCELLED`, `REJECTED`, `EXPIRED`, `CHECKED_IN`, `COMPLETED`, `NO_SHOW`, `REFUND_PENDING`, `REFUNDED`.

`COMPLETED` is defined and labelled. **No transition writes it (OQ-10).**

## Internal-only (not customer chrome)

| Enum | Values | Why internal |
| --- | --- | --- |
| `payment_status` | `NONE`, `PROOF_SUBMITTED`, `CASH_RECEIVED`, `VERIFIED`, `REJECTED` | Distinct from booking status (`admin/09`). |
| `payment_method` | `GCASH`, `PAY_AT_COUNTER` | Method, not lifecycle. |
| `refund_status` | `NOT_APPLICABLE` plus the two labelled values | `NOT_APPLICABLE` is bookkeeping. |
| `session_status` | `DRAFT`, `PUBLISHED`, `CANCELLED` | Admin publish state. |
| `event_status` | `DRAFT`, `PUBLISHED`, `CANCELLED`, `ARCHIVED` | Event presentation layer (#319). Does not replace `session_status`. |
| `venue_kind` | `BRANCH`, `OFFSITE` | Where a session runs. Internal; labels "Branch" / "Off-site" (`venueKindLabel`). |
| `coach_rate_type` | `PER_SESSION`, `PER_HOUR` | Admin-only compensation. |
| `staff_role` | `ADMIN` | Leftover BE-001 enum. **Not authorization truth** after #298 (`roleId` + `staff_role_definitions`). **No `COACH` value** (teaching is a link). Enum drop is a later wave. |
| `staff_role_definition_status` | `ACTIVE`, `ARCHIVED` | Custom roles archive; built-ins stay `ACTIVE`. |
| `staff_status` | `ACTIVE`, `DISABLED` | Staff access switch. |
| `waitlist_status` | `WAITING`, `PROMOTED`, `WITHDRAWN`, `EXPIRED` | FIFO machinery. |
| `request_resolution` | `OPEN`, `COMPLETED`, `REJECTED` | Request rows, not booking status. |
| `audit_actor_type` | `STAFF`, `SYSTEM`, `CUSTOMER` | Audit only. |
| `policy_document_kind` | waiver / gym / participation / cancellation | Catalogue. |
| `bundle_status` | `DRAFT`, `PUBLISHED`, `ARCHIVED` | Package catalogue (BE-058). |
| `bundle_applicability_mode` | `ALL_ACTIVE_CLASSES`, `EXPLICIT_CLASSES` | Class set, not coach. |
| `bundle_acquisition_kind` / `bundle_acquisition_status` | claim / paid / grant + pending/approved | Order row. |
| `customer_bundle_status` | `ACTIVE`, `EXHAUSTED`, `EXPIRED`, `REVOKED` | Issued entitlement. |
| `bundle_redemption_status` | `HELD`, `CONSUMED`, `RESTORED` | Credit ledger. |

## Profile / onboarding (#344)

Values must match the option lists in `@balanse/domain` (`packages/domain/src/onboarding.ts`, #346). Labels live there, not in the database.

| Enum | Values | Notes |
| --- | --- | --- |
| `fitness_goal` (`FitnessGoal`) | `STRENGTH`, `FLEXIBILITY_MOBILITY`, `WEIGHT_MANAGEMENT`, `STRESS_RELIEF`, `POSTURE_CORE`, `ENDURANCE`, `COMMUNITY`, `OTHER` | Multi-select. **No medical / injury value** (OQ-3). `OTHER` pairs with `goalsOther` (≤ 120 chars). |
| `experience_level` (`ExperienceLevel`) | `NEW`, `SOME`, `REGULAR`, `ADVANCED` | Single choice, nullable. |
| `heard_from_source` (`HeardFromSource`) | `FRIEND`, `INSTAGRAM`, `FACEBOOK`, `TIKTOK`, `GOOGLE`, `EVENT`, `WALK_IN`, `OTHER` | Single choice, nullable. `OTHER` pairs with `heardFromOther`. |
| `referral_channel` (`ReferralChannel`) | `CUSTOMER_LINK`, `CUSTOMER_QR`, `STUDIO_LINK`, `STUDIO_QR` | Set once at sign-up by `handle_new_user`. `CUSTOMER_*` requires a valid `ref`; `STUDIO_*` does not. Internal (marketing insights counts only). |

All four are re-exported from `@balanse/db/enums`.

No invented **booking** states beyond the docs above. Bundle enums are internal catalogue/ledger vocabulary (customer chrome says “Package”).
