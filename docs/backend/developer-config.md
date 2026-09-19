# Developer-controlled configuration (BE-019)

Single values:

| Key | Default | TypeScript | SQL |
| --- | --- | --- | --- |
| `BOOKING_HOLD_DURATION_HOURS` | `8` | `@balanse/domain` | `developer_config` + `app_private.developer_config_int` |
| `BOOKING_CUTOFF_MINUTES_BEFORE_START` | `15` | same | same |

Hold deadline: `LEAST(reserved_at + hold, session.starts_at)`.

These keys are **not** granted to `anon` / `authenticated` and must never appear on `GET/PATCH /api/admin/settings` (BE-043).

## Change process

From `docs/business-requirements/17-developer-config.md`:

1. Rex contacts the developer.
2. Update `packages/domain/src/developer-config.ts` **and** upsert `developer_config` (migration or seed).
3. Deploy.
4. Existing bookings keep recorded `holdExpiresAt` / statuses — jobs read the new values only for **new** computations.
