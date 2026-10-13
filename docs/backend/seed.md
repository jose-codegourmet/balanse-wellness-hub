# Seed (BE-023)

```bash
BALANSE_ALLOW_DB_SEED=1 pnpm --filter @balanse/db db:seed
```

Against `xydundrayuusqizssgby` also set `BALANSE_ALLOW_SHARED_PROJECT_SEED=1`. Seed never runs from CI or `postinstall`.

Idempotent upserts:

- Canonical `permission_definitions` + three built-in roles from `@balanse/domain` (`seedCanonicalRolesAndPermissions`). Super Admin snapshot is additive; Front Desk / Coach matrices are migration-seeded and trigger-protected.

- §4b coach roster (exact spelling). `staffMemberId` stays null — seed does not create staff (needs `auth.users`). `coach-rex` is the same human as mock `staff-rex` / photo slug `rex-francis-regis`; link via BE-055 after the staff account exists.
- Class catalogue from the findings + timetable labels
- One week of sessions (14–20 Sep 2026, Asia/Manila slots)
- Three historical class change requests from `class-change-fixtures.ts`, upserted without overwriting later reviews (WIRE-E20).
- Placeholder prices `999.00` / rates `500.00` with `isPlaceholder = true`
- Placeholder policy versions (`isPlaceholder`, body says it is not legal text)

No real customer rows. No invented waiver lawyering.

## Class ids (WIRE-0506, #358)

`CLASSES` ids (`class-yoga`, `class-pilates`, …) match the catalogue import's hyphenated convention, not an invented `class_*` scheme, so the seed's `gymClass.upsert` hits the same 9 rows the import created on `xydundrayuusqizssgby` (`name` is `@unique`, so a mismatched id would collide on create instead of updating) and only adds the 4 missing ones (`Contemporary`, `Groove`, `Femme`, `Kids Classes`) as drafts. The `update` branch only touches `name`/`isPlaceholder` — never `defaultCustomerPrice`/`defaultDurationMinutes` — so re-seeding never overwrites the real per-class prices the import/admin editor already set on those 9 rows.

## Coach ids and photos (WIRE-0601, #359)

`COACHES` ids (`coach-rex`, `coach-ephraim`, …) match the catalogue import's hyphenated convention. `Coach.name` has no unique constraint (unlike `GymClass`), so a mismatched id would not error on re-seed — it would silently create 11 duplicate coaches instead of updating the imported rows. `photoKey` is set from `packages/domain/src/asset-manifest.json`'s `coach_slug` only for the 8 coaches with an uploaded object under `coach-photos/<slug>/` in storage; `coach-alec`, `coach-kate`, and `coach-sofia` have manifest slugs but no uploaded headshot yet, so they stay `null` until that upload lands. The `update` branch sets `photoKey` only when the fixture has one, so re-seeding never overwrites a real admin-replaced photo (or a still-missing one) with this fixture's `null`.

## Profile identity (#344)

Customer demo data is seeded through `auth.users` only when
`BALANSE_ALLOW_AUTH_SEED=1` is set. It includes placeholder avatars, thirteen
onboarding answer sets, five referral relationships, and staggered
`profiles.createdAt` signup dates. These fixtures use only placeholder content;
never seed a real photo into `avatars`.
