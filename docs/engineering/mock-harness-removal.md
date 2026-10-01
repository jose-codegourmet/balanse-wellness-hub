# WIRE-002 — remove the mock session harness

When real Supabase Auth lands:

1. Delete `apps/*/src/modules/dev-harness/MockSessionHarness.tsx` and the shared `MockHarnessAffordance` in `@balanse/ui` (`packages/ui/src/balanse/mock-harness-affordance/`).
2. Replace `MockSessionProvider` with the auth session provider.
3. Replace cookie `balanse-mock-principal` reads in `apps/admin/middleware.ts` and portal guards.
4. Drop `NEXT_PUBLIC_ENABLE_MOCK_HARNESS`.
5. Keep screens talking to a data adapter; swap `@balanse/mock` for the WIRE-001 client.

The harness is imported only from app providers/shells, never from screen-level feature components.

`apps/web` (2026-10-01): steps 2–3 done — `MockSessionProvider` and the portal mock-cookie guard are replaced by Supabase Auth (see `docs/backend/auth.md`). The web harness keeps only the calendar scenario switcher. `apps/admin` is unchanged.
