# Hold expiry and waitlist promotion (BE-018)

## Entry point

`SELECT public.expire_holds_and_promote_waitlist();`

Idempotent. Uses `FOR UPDATE SKIP LOCKED` and per-session advisory locks. Safe to overlap.

Behaviour:

1. Expire `HELD_AWAITING_PAYMENT` rows with `holdExpiresAt <= now()`.
2. Write `audit_events` with `actorType = SYSTEM` (never a random admin).
3. Promote the earliest `WAITING` FIFO entry if the session is `PUBLISHED`, under capacity, and **before** cutoff.
4. Promoted hold = `LEAST(now() + hold duration, starts_at)`.

`public.evaluate_waitlist_promotion(session_id)` is also called from admin reject and completed cancellation.

## Schedule

If `pg_cron` is available the migration attempts:

`*/5 * * * *` → `balanse-expire-holds-promote`

`15 * * * *` → `balanse-reap-pending-uploads` (`SELECT public.reap_pending_uploads()`) — BE-052 orphan signed-upload rows older than 24 hours.

## Observability

The function returns `{"expired": n, "promoted": n}`. Audit actions: `hold.expire`, `waitlist.promote`.

## Human-only

On project `xydundrayuusqizssgby`, confirm in the Dashboard that `pg_cron` is enabled. If the extension create was skipped, schedule the same SQL in the Dashboard cron UI. Do not put the job in a client app.
