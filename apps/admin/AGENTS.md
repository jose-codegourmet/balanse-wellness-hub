# Admin app

Admin mocks. Read `docs/screen-specs/admin/`. Never expose sign-up or forgot-password. Coach rates stay on admin types only.

## Components

- **Source order:** `@balanse/ui` first for anything shared; vendored Jabkit under `src/components/jabkit/` (pristine, installed via `npx @jabkit/cli add <name>`, never hand-edited) for blocks that exist upstream; `src/components/balanse/` for admin-only composition of either. Existing mixed imports stay as they are until a ticket migrates them.
- **Authoring standard:** `docs/component-guide.md` — the five-file set applies to `src/components/balanse/` too, and every admin component gets a colocated story.
- **Forms:** use the admin form kit from `FE-ADM-019` (#209) once it lands — `react-hook-form` + `zodResolver` + the `@balanse/ui` field family. No new hand-rolled `useState` form objects, no new private `Field` wrappers (three already exist and #209 deletes them).
- **Tables:** `AdminDataTable` (`src/components/balanse/AdminDataTable.tsx`). The `DataTable({ columns: string[] })` helper in `modules/admin/shared.tsx` is deprecated and removed by `FE-ADM-017` (#207) — do not add call sites.
- **Data:** `getMockAdapter()` only, through the React Query layer from `FE-ADM-015` (#204) once it lands; never import `packages/mock/src/fixtures.ts` from a screen (stories may).
- **Stories:** a new or changed admin component lands with a colocated story in the same PR. Titles: `Admin/Screens/<Screen>` for page modules, `Admin/Components/<Component>` for `src/components/balanse/`. Preview globals (see `.storybook/preview.tsx`): `theme` (light/dark), `principal` (`admin` / `customer` / `guest`), `parameters.mockRuntime` (`latencyMs`, `failNext`, `emptyAdminQueues`), and viewport presets at 360 / 768 / 1280. Run `pnpm --filter admin test-storybook` locally before shipping. Sidebar / data-table / page-shell / form-kit / queue stories belong to #205 / #207 / #208 / #209 / #210 — do not add competing files here.
