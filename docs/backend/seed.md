# Seed (BE-023)

```bash
BALANSE_ALLOW_DB_SEED=1 pnpm --filter @balanse/db db:seed
```

Against `xydundrayuusqizssgby` also set `BALANSE_ALLOW_SHARED_PROJECT_SEED=1`. Seed never runs from CI or `postinstall`.

Idempotent upserts:

- Canonical `permission_definitions` + three built-in roles from `@balanse/domain` (`seedCanonicalRolesAndPermissions`). Super Admin snapshot is additive; Front Desk / Coach matrices are migration-seeded and trigger-protected.

- §4b coach roster (exact spelling). `staffMemberId` stays null — seed does not create staff (needs `auth.users`). `coach_rex` is the same human as mock `staff-rex` / photo slug `rex-francis-regis`; link via BE-055 after the staff account exists.
- Class catalogue from the findings + timetable labels
- One week of sessions (14–20 Sep 2026, Asia/Manila slots)
- Placeholder prices `999.00` / rates `500.00` with `isPlaceholder = true`
- Placeholder policy versions (`isPlaceholder`, body says it is not legal text)

No real customer rows. No invented waiver lawyering.
