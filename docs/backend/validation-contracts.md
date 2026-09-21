# Admin write validation (BE-051)

Authoritative constraint tables live in `@balanse/domain` as `FIELD_CONSTRAINTS`. Prisma, check constraints, and `@balanse/api` validators must agree. FE-ADM-019 should diff zod schemas against that object.

## Money

**Whole pesos as decimal strings** (`"1500.00"`), Prisma `Decimal(12, 2)`. Not centavos. Integer pesos are accepted and coerced. Matches `formatPeso` over whole numbers on the FE.

## Stored long-form format

`classes.shortDescription`, `coaches.shortBio`, `about`, and FAQ `answer` are **CommonMark** (emphasis, strong, links, ordered/unordered lists). Sanitisation is **render-time** in the public/admin renderer (`FE-SHR-010`). Writes store the markdown as submitted (length-capped). Not sanitised HTML.

## Status codes

| Status | When |
| --- | --- |
| **422** `validation_failed` | Field/form rules (`FIELD_CONSTRAINTS`, format, range, `endsAt > startsAt` before persist). |
| **409** | Unique class name; capacity dropped below consumed bookings (race or otherwise). |
| **403** | Non-admin principal. `StaffRole` is `ADMIN` only today — admin-only fields (`defaultRate`, `rateType`, session snapshots) are reachable only after `requireAdmin`. A future non-admin staff role must 403 those fields rather than drop them. |
| **400** | Malformed JSON, illegal cursor, developer-config keys on settings. |

Shape:

```json
{
  "error": "validation_failed",
  "fieldErrors": [{ "path": "capacity", "code": "below_confirmed_count", "message": "..." }],
  "formErrors": []
}
```

`path` is the FE field path (dotted / indexed). `code` is from `VALIDATION_ERROR_CODES`.

BE-055 / BE-056 additions: `already_linked`, `cannot_remove_active`, `qr_limit`. Staff-disabled link uses existing `inactive_reference`.

## Invariants

- `sessions.endsAt > startsAt` is a **database CHECK**. Max duration 8 hours is validator-only.
- Capacity vs consumption is **transactional**: `public.update_session_capacity` locks the session row and compares `app_private.session_consumed_capacity` (holds + confirmed + in-flight requests — same as BE-017). This is stricter than “confirmed only”.
- Coach `defaultRate` / `rateType` updates **cannot** rewrite `sessions.coachRate` / `coachRateType`. Those columns are a write-time snapshot; there is no UPDATE trigger or cascade from `coaches`. Sending snapshot fields on session PATCH is 422 `read_only`.
- Session create copies the current coach default into the snapshot once. Inactive class/coach references are rejected.
- Specialties are **free-text tags** (max 12 × 40), not a closed vocabulary — the FE tag input is correct.
- Class `name` is unique per studio (`classes.name` `@unique`).
- PH GCash number: `09XXXXXXXXX` or `+639XXXXXXXXX`.
- Policy version on promote: `YYYY-MM`. Existing placeholder versions remain readable.

Enums match `packages/domain/src/enums.ts` / BE-001. Divergence is a bug.
