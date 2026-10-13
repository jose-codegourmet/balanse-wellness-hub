# Database-backed class publishing

The class catalogue is an explicit exception to the mock-only UI phase, authorized on 2026-09-21. Other entities and booking flows remain mocked. Project: `xydundrayuusqizssgby`.

## Configuration

Set server-side `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in both apps. Set `NEXT_PUBLIC_MARKETING_URL` in admin to the public site's origin (locally http://localhost:9000). Never use a service-role key in public environment variables. Local ignored environment files are configured; deploy environments require their own settings.

`NEXT_PUBLIC_CLASS_CATALOGUE_MODE` is retired (WIRE-0501/0507, #358): the catalogue is always live now, through `GET/POST/PATCH /api/admin/classes` and `GET /api/public/classes` (both route through the same `readClassCatalogue`/`writeClassCatalogue` RPC path below), and `apps/web/src/lib/class-catalogue.ts` has no mock fallback left to switch off.

## Data and boundaries

- Classes persist name, slug, custom redirect URL, introduction, rich-text description, cover, ordered gallery, customer price, duration and visibility.
- `class_marketing_coaches` is a many-to-many public teaching roster. It does not assign coaches to sessions. Sessions still independently require at least one coach.
- Hosted has 13 classes (imported out-of-band, hyphenated ids like `class-yoga`, not the seed's `class_yoga`) and eleven public coach profiles, with seventeen marketing-coach assignments covering the original nine classes; the four more recently added classes (`class-contemporary`, `class-femme`, `class-groove`, `class-kids`) have no marketing-coach rows yet. Starter rows are marked `isPlaceholder`; imported coach compensation is zero placeholder data, not an owner-approved rate. No customer, booking or auth records were imported. `seed.ts`'s `CLASSES` ids still use the underscore convention and do not match hosted — reconcile ids before running the seeder against hosted (it would otherwise collide on the `name` unique constraint).
- Generated artwork is bundled under each app's `public/assets/marketing/classes`; database rows store these paths.
- Public /classes and /classes/[slug] read the same database as the admin list/editor. Active classes are public; drafts are admin-only. Custom URLs redirect the canonical class path; local paths must be outside /classes, or use HTTPS. Unsaved layout previews are never publication.
- Schedule, booking and other admin screens still use MockDataAdapter. Creating a database class does not create a mock session. This intentionally does not pretend all entities are integrated.

## Authorization

The class editor's separate cookie-based Supabase sign-in is retired (WIRE-0505, #358). Writes now go through the signed-in admin's real staff session (`GET /api/admin/me`, E02 / #357) — the same bearer token every other `/api/admin/*` route uses — forwarded to the `save_class_catalogue` RPC so its own RLS check runs as that caller. The RPC itself still only accepts an active, non-system **ADMIN**-role staff member (`app_private.catalogue_is_admin()`), independent of the app's `classes.manage` permission grant; a staffer with `classes.manage` but a non-ADMIN role will pass the HTTP route's own permission check and then be rejected by the RPC with a 403. This pre-existing restriction was not widened by WIRE-E05.

Writes use a SECURITY INVOKER RPC and RLS. Class plus roster updates are atomic. Public coach access grants only identity/bio/photo columns, never compensation. Drafts and unauthorized writes are denied by PostgreSQL, not merely hidden buttons.

No `staff_members` rows exist on hosted yet (still true as of WIRE-E05). The owner must identify/provision the first administrator through the existing auth/profile/staff workflow before anyone can save through the class editor. Do not invent an account, grant a role based on mock data, or treat `user_metadata` as authorization.

## Migration status

`supabase/migrations/20260921061018_class_marketing_catalogue.sql` was applied through the Supabase migration tool. Its identical Prisma copy is `20260921130000_class_marketing_catalogue/migration.sql`, and the multi-file Prisma schema is updated. The follow-up validation migration (`20260921062038_class_catalogue_validation`, Prisma copy `20260921131000_class_catalogue_validation`) also ran, enforcing class names, introductions, nonnegative prices, duration bounds and root-path redirects. All previously-staged migrations this project was once behind — session coach assignments, staff/role/permission expansion, session bundles, session events, venues, front-desk access expansion, and the #344/#345 profile-identity and public-read functions — have since been reviewed and deployed (WIRE-0001/WIRE-0002, 2026-10-02); the hosted `_prisma_migrations` ledger and the Supabase migration history are reconciled.

## Verification and known limitations

### Hosted permissions repair (2026-10-03, #358)

`20261003031452_restore_class_catalogue_grants` restores the catalogue ACLs lost
during the earlier RLS-baseline replay. Both anonymous and signed-in users may
read published classes and their marketing-coach assignments. Public coach reads
are limited to identity/bio/photo fields; table-wide coach SELECT is revoked so
column restrictions cannot be bypassed. Compensation remains behind the existing
permission-checked server API. Existing RLS policies and the SECURITY INVOKER save
RPC remain unchanged; authenticated roster writes still require those policies.

The migration is applied to `xydundrayuusqizssgby` and recorded with its exact
checksum/SQL in Prisma and Supabase history. No classes, accounts, assignments, or
prices were changed. Verification covered:

- Anonymous REST reads and both local `/api/public/classes` endpoints: HTTP 200,
  13 active classes, 11 public coaches, and 17 marketing assignments.
- The actual public `/classes` page renders while signed out.
- Rollback-only authenticated-admin checks: draft create/read/update and assignment
  insert/removal through `save_class_catalogue`; non-staff and anonymous draft
  reads and saves denied. The temporary draft was rolled back, not published.
- Direct coach-rate reads denied; security advisors report no new findings.
  Existing advisories remain tracked in `supabase-project.md` (including
  [definer views](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)).

Earlier delivery notes below describe the original catalogue rollout, not the
current staff-provisioning state. Authenticated admin UI verification needs an
existing signed-in browser session; no credentials were generated for this repair.

Anonymous REST reads returned nine classes with seventeen assignments. Direct coach compensation reads and anonymous RPC saves were denied (42501). The first interactive authenticated save requires an owner-provisioned administrator. App typechecks and browser checks are documented in the task handoff; no new test suites were added.

`public._prisma_migrations` RLS was previously disabled with anonymous SELECT permission; it is now **enabled** with no policies (WIRE-0006, 2026-10-02 — see `docs/backend/supabase-project.md` "RLS advisories"). `postgres`-role migration tooling (Prisma) is unaffected. Review that section for the other pre-existing advisories before production deployment.
