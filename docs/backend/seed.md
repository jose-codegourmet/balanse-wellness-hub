# Seed (BE-023)

```bash
BALANSE_ALLOW_DB_SEED=1 pnpm --filter @balanse/db db:seed
```

Against `xydundrayuusqizssgby` also set `BALANSE_ALLOW_SHARED_PROJECT_SEED=1`. Seed never runs from CI or `postinstall`.

Idempotent upserts:

- §4b coach roster (exact spelling)
- Class catalogue from the findings + timetable labels
- One week of sessions (14–20 Sep 2026, Asia/Manila slots)
- Placeholder prices `999.00` / rates `500.00` with `isPlaceholder = true`
- Placeholder policy versions (`isPlaceholder`, body says it is not legal text)

No real customer rows. No invented waiver lawyering.
