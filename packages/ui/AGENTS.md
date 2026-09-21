# Agent Instructions — `packages/ui`

Local agent instructions for the shared UI package. Read `/AGENTS.md` first, then this file.

## Read order

Follow the root `AGENTS.md` order and stop once the picture is clear:

1. **OpenSpec** — `openspec/specs/fe-shared-systems.md` and `openspec/specs/fe-foundation.md` (plus the consuming app spec when the primitive is used by a specific screen). Check `openspec/changes/` if a matching change is in flight.
2. **`Component.meta.ts`** — colocated in `src/components/<kebab-name>/`. If it already explains the primitive, do not skim `Component.tsx`.
3. **Implementation** — only when the meta is missing, stale, or does not answer the question.

---

## Scope

`packages/ui` (`@balanse/ui`) is the shared UI primitive library for both apps. It contains shadcn/Base UI style components, a `DataTable`, a `ScrollReveal` motion component, form helpers, and the `cn()` utility. It ships TypeScript/TSX source and has no build step.

- **Workspace name**: `@balanse/ui`
- **Filter**: `pnpm --filter @balanse/ui`
- **Package name**: `@balanse/ui`

---

## Public entry points

| Entry | Path | What it provides |
|---|---|---|
| `.` | `src/index.ts` | Barrel export of all components and `cn` |
| `./styles.css` | `src/styles.css` | `tw-animate-css` import |
| `./*` | `src/components/*` | Subpath access to individual components (not currently used by apps) |

---

## Consumers

- `apps/web` — marketing sections, layout, showcase.
- `apps/admin` — dashboard tables, dialogs, forms, layout, charts.

Both apps consume `@balanse/ui` at runtime. No other workspace *package* (`packages/db`, `packages/config`) depends on it.

---

## Important directories

| Directory | Purpose |
|---|---|
| `src/components/` | One folder per component (64 today; see `src/index.ts`) |
| `src/hooks/` | Shared viewport hooks (`useMediaQuery`, `useBreakpoint`, `useMinWidth`, `useIsMobile`) |
| `src/components/table/data-table/` | `DataTable` wrapper around TanStack Table |
| `src/components/motion/scroll-reveal/` | `ScrollReveal` motion component |
| `src/lib/utils.ts` | `cn()` utility |
| `src/index.ts` | Public barrel export |
| `src/styles.css` | `tw-animate-css` import |

---

## Validation commands

| Concern | Command |
|---|---|
| Type check | `pnpm --filter @balanse/ui typecheck` |
| Lint (Biome) | `pnpm --filter @balanse/ui lint` |
| Biome (repo-wide) | `pnpm lint` |

---

## Restrictions and boundaries

- Preserve the public barrel in `src/index.ts` when adding or renaming components. Do not remove exports unless the component is being deleted.
- Do not import app-specific code into this package. It must remain generic.
- Do not add app-specific business logic to components. Keep primitives composable.
- Keep peer dependencies minimal: `react` and `react-dom` are currently required.
- Adding a new dependency here affects both apps. Prefer adding to a specific app if the dependency is not needed by both.

---

## Common task routing

| Task | Read next |
|---|---|
| Add a new primitive | `packages/ui/docs/development.md`, `docs/component-guide.md`, `docs/templates/component/` |
| Change a component API | `packages/ui/docs/api.md`, then search consumers in both apps |
| Fix a styling issue | `docs/styling-and-design-system.md` |
| Update `cn()` | `src/lib/utils.ts` — changes affect both apps |

---

## Documentation maintenance

Update this file and `packages/ui/docs/` when:
- A new public export is added.
- A component API changes.
- A new consumer appears.
- The build or validation commands change.

## Marketing presentation hooks

`PublicNav` accepts optional `mobileCtaVisible` and `mobileCtaOnly` presentation props; booking-area observation stays in the consuming app. `ScheduleCalendar` exposes calendar controls/grid/sessions data attributes for scoped marketing styles. See `docs/api.md` for defaults and usage.
