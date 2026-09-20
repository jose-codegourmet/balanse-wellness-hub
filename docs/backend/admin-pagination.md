# Admin cursor pagination (BE-050)

All admin queues and the admin bookings table share one envelope:

```ts
type CursorPage<T> = { items: T[]; nextCursor: string | null; totalCount: number };
```

Defined in `@balanse/domain` (`CursorPage`). Offset pagination stays on reports (`page` / `pageSize`) only.

## Request

| Param | Default | Max | Notes |
| --- | --- | --- | --- |
| `limit` | 20 (bookings: 8) | 50 | Rejected if not a positive integer. |
| `cursor` | omitted | — | Opaque. Unknown or malformed → **400** `invalid_cursor`. Never silently restarts at the beginning. |
| `tab` | list-specific | — | Server-side filter. Payments: `gcash` \| `counter` \| `refunds` (aliases `gcash_pending`, `pay_at_counter` accepted). |

## Cursor encoding

Unsigned base64url JSON `{ v: 1, s: "<sort_id>", k: "<sort_key>", i: "<id>" }`. **Not signed** — no extra secret is introduced. The client must treat it as opaque. `s` binds the cursor to one sort so a tab/sort mismatch is a 400.

## Sort (why)

| List | Order | Why |
| --- | --- | --- |
| Cancellations / reschedules | `requestedAt DESC, id DESC` | Newest request first; `id` is the tiebreak so the cursor is unique. |
| Payments `gcash` / `counter` | `booking.holdExpiresAt ASC, payment.id ASC` | Most urgent hold first. |
| Payments `refunds` | `createdAt DESC, id DESC` | Newest refund work first. |
| Bookings | `reservedAt DESC, id DESC` | Same envelope as queues; table still pages with `limit`. |

Payment tab predicates are the same as `@balanse/domain` `paymentQueueKind` / `filterPaymentQueue` — the FE must not fetch-all-and-filter.

Queue rows always include `customerName` (display name only). No extra PII on queue items.

`totalCount` is an **exact** filtered count. Cheap at current studio scale. If it becomes expensive, make it optional and update the FE a11y announcement — do not drop it silently.

## Indexes

Composite indexes match the `ORDER BY` tuples (migration `20260920163000_be050_054_admin_contracts`). Handlers use the service role and **bypass RLS**; index use is not defeated by row-security predicates in this process. If a future client queried through `authenticated` + RLS, the admin-only policies (`is_admin()`) still qualify the same indexes.

Expected plans (verify with `EXPLAIN` after migrate on `xydundrayuusqizssgby`):

- Open cancellation/reschedule queues: index-only or index scan on `(resolution, requestedAt, id)`.
- Bookings: `(reservedAt, id)` plus status filter.
- Payment urgency: nestloop/join from `payments(method, status, …)` to `bookings(holdExpiresAt, id)`.
