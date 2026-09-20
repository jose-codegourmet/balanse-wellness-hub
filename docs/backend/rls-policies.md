# RLS policy suite (BE-020)

RLS is enabled on every business table in `public`. `developer_config` and `app_meta` have RLS on and **no** policies for `anon`/`authenticated` (Data API closed). Prisma uses the database owner / service role and **bypasses RLS**.

Equivalent checks must live in BE-030+ route handlers.

Authorisation: `public.is_admin()` → active `staff_members.role = ADMIN` and `isSystem = false`. Do **not** read `user_metadata` / `raw_user_meta_data` for authz.

| Table | anon | customer (`authenticated`) | admin |
| --- | --- | --- | --- |
| `coaches` | none (use `coaches_public`) | none | all |
| `coaches_public` | select public columns | select | select |
| `classes` / `sessions` | published/active read | same | all |
| `profiles` | — | own row | all |
| `bookings` | — | own; insert only waitlist/hold; cannot set `CONFIRMED`/`CHECKED_IN` | all |
| `payments` | — | own booking; cannot verify | all |
| `refunds` | — | — | all |
| `waitlist_entries` / requests / acceptances | — | own | all |
| `staff_members` / `audit_events` | — | — | admin |
| `developer_config` | — | — | — (postgres only) |
| `faqs` | select | select | all |
| `pending_uploads` | — | — | all |

Negative guarantees:

- Customer A cannot read B's booking/payment/profile (`profileId` / join checks).
- Anon cannot read bookings, payments, coach rates, or reports.
- Customer cannot persist `CONFIRMED`, `CHECKED_IN`, or refund rows.
- Coach rate columns are not granted through `coaches_public`.

`session_roster_metrics` and report functions are revoked from Data API roles.
