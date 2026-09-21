# Database-backed class publishing

The class catalogue is an explicit exception to the mock-only UI phase, authorized on 2026-09-21. Other entities and booking flows remain mocked. Project: `xydundrayuusqizssgby`.

## Configuration

Set server-side `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in both apps, plus `NEXT_PUBLIC_CLASS_CATALOGUE_MODE=database`. Set `NEXT_PUBLIC_MARKETING_URL` in admin to the public site's origin (locally http://localhost:9000). Never use a service-role key in public environment variables. Local ignored environment files are configured; deploy environments require their own settings.

## Data and boundaries

- Classes persist name, slug, custom redirect URL, introduction, rich-text description, cover, ordered gallery, customer price, duration and visibility.
- `class_marketing_coaches` is a many-to-many public teaching roster. It does not assign coaches to sessions. Sessions still independently require at least one coach.
- Nine existing starter classes and eleven public coach profiles were imported with seventeen assignments. Starter rows are marked `isPlaceholder`; imported coach compensation is zero placeholder data, not an owner-approved rate. No customer, booking, staff or auth records were imported.
- Generated artwork is bundled under each app's `public/assets/marketing/classes`; database rows store these paths.
- Public /classes and /classes/[slug] read the same database as the admin list/editor. Active classes are public; drafts are admin-only. Custom URLs redirect the canonical class path; local paths must be outside /classes, or use HTTPS. Unsaved layout previews are never publication.
- Schedule, booking and other admin screens still use MockDataAdapter. Creating a database class does not create a mock session. This intentionally does not pretend all entities are integrated.

## Authorization

The class editor has a separate verified Supabase admin sign-in. The existing preview/mock login is not an authorization source. The server validates the user and an active, non-system ADMIN staff row. Tokens use an HttpOnly, same-site cookie and expire with the Supabase session; sign in again after expiry. No refresh credentials are persisted.

No auth users or admins existed when this project was inspected. The owner must identify/provision the first administrator through the existing auth/profile/staff workflow. Do not invent an account, grant a role based on mock data, or treat user_metadata as authorization.

Writes use a SECURITY INVOKER RPC and RLS. Class plus roster updates are atomic. Public coach access grants only identity/bio/photo columns, never compensation. Drafts and unauthorized writes are denied by PostgreSQL, not merely hidden buttons.

## Migration status

`supabase/migrations/20260921061018_class_marketing_catalogue.sql` was applied through the Supabase migration tool. Its identical Prisma copy is `20260921130000_class_marketing_catalogue/migration.sql`, and the multi-file Prisma schema is updated. The follow-up validation migration (`20260921062038_class_catalogue_validation`, Prisma copy `20260921131000_class_catalogue_validation`) also ran, enforcing class names, introductions, nonnegative prices, duration bounds and root-path redirects. The shared project is behind other staged migrations, including session coach assignments. Do not blindly deploy all pending migrations or rerun this migration: inspect and reconcile both migration histories first. No unrelated pending migrations were applied here.

## Verification and known limitations

Anonymous REST reads returned nine classes with seventeen assignments. Direct coach compensation reads and anonymous RPC saves were denied (42501). The first interactive authenticated save requires an owner-provisioned administrator. App typechecks and browser checks are documented in the task handoff; no new test suites were added.

The project also has a pre-existing security finding: public `_prisma_migrations` has RLS disabled and anonymous SELECT permission. It was not changed as part of class publishing. Review [Supabase's RLS remediation](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public) and the project's other pre-existing security advisories before production deployment.
