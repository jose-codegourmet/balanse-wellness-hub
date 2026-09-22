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
| `coach_rate_type` | `PER_SESSION`, `PER_HOUR` | Admin-only compensation. |
| `staff_role` | `ADMIN` | Authorisation, not a customer status. **No `COACH` value** (BE-055: teaching is a link, not a role). |
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

No invented **booking** states beyond the docs above. Bundle enums are internal catalogue/ledger vocabulary (customer chrome says “Package”).
