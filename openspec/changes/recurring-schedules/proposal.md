# OpenSpec — Recurring schedules (#288)

## Why

Re-entering the same operational schedule one session at a time is error-prone. Epic #288 promotes bounded schedule automation from the historical future-scope list.

## What

- Duplicate a source week/month/range forward while preserving operational session fields.
- Mark an existing session as a weekly template across an inclusive date range and selected weekdays.
- Preview occurrence counts, create drafts by default, and report exact matches that were skipped.
- Store recurrence provenance in Postgres and expose admin-only bulk-generation API routes.
- Preserve existing capacity, booking, cancellation, reporting, and compensation-snapshot invariants.

## Decisions

- Weekly cadence only; multiple weekdays are supported.
- `Asia/Manila` is fixed for recurrence calculations.
- Exact class/start-time matches are skipped.
- Current coach defaults are captured for each newly generated session.
- Existing sessions and bookings are never overwritten or cloned.
- Holiday/exception rules and series-wide mutation are deferred.

## Validation

- Admin and mock package typechecks.
- Prisma client generation and migration review.
- API contract generation and handler typecheck, excluding already-known legacy fixture compile failures.
- Desktop/mobile browser verification of both admin forms.
