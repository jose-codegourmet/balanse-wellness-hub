# `@balanse/ui` — Shared UI Primitives

Purpose, consumers, and usage for the shared UI library.

---

## Purpose

`@balanse/ui` is a shared UI primitive library built on Base UI with shadcn-style conventions. It provides 63 component folders (see `src/index.ts` for the current export list), including a `DataTable`, a `ScrollReveal` motion component, form helpers, and the `cn()` utility. Both apps import from it, so changes here affect all consumers.

---

## What problems it solves

- Provides a single source of truth for UI primitives across the monorepo.
- Avoids duplicated shadcn/component code in each app.
- Enforces consistent styling, accessibility, and API patterns.

---

## Intended consumers

- `apps/web` — marketing sections, layout, showcase.
- `apps/admin` — dashboard tables, dialogs, forms, layout, charts.

Both apps consume this library at runtime. No other workspace *package* (`packages/db`, `packages/config`) depends on it.

---

## Public entry points

| Entry | Path | What it provides |
|---|---|---|
| `@balanse/ui` | `src/index.ts` | Barrel export of all components and `cn` |
| `@balanse/ui/styles.css` | `src/styles.css` | `tw-animate-css` import |
| `@balanse/ui/*` | `src/components/*` | Subpath access to individual components (not currently used by apps) |

---

## Major dependencies

| Dependency | Purpose |
|---|---|
| `@base-ui/react` | Core accessible primitives (Button, Dialog, Select, Tabs, etc.) |
| `@shadcn/react` | `MessageScroller` |
| `@tanstack/react-table` | `DataTable` |
| `class-variance-authority` | Variant APIs |
| `clsx` + `tailwind-merge` | `cn()` utility |
| `cmdk` | `Command` component |
| `embla-carousel-react` | `Carousel` and `EmblaCarousel` |
| `framer-motion` | `ScrollReveal` |
| `input-otp` | `InputOTP` |
| `lucide-react` | Icons |
| `next-themes` | `Toaster` theme awareness |
| `react-day-picker` | `Calendar` |
| `react-hook-form` | `Form` helpers |
| `react-resizable-panels` | `Resizable` components |
| `recharts` | `Chart` components |
| `sonner` | `Toaster` |
| `tw-animate-css` | Global animation CSS |
| `zod` | Form schemas in some components |

---

## Basic usage

```tsx
import { Button, Card, ScrollReveal, cn } from "@balanse/ui";
```

For variant classes:

```tsx
import { buttonVariants } from "@balanse/ui";
import Link from "next/link";

<Link href="/" className={buttonVariants({ variant: "outline" })}>Home</Link>
```

---

## Development and validation commands

| Command | Purpose |
|---|---|
| `pnpm --filter @balanse/ui typecheck` | TypeScript check |
| `pnpm --filter @balanse/ui lint` | Biome check for this package (`biome check .`) |
| `pnpm lint` | Biome check across the repo |

---

## Local docs

- `packages/ui/docs/api.md` — public exports and API stability
- `packages/ui/docs/development.md` — how to add and change components
- `packages/ui/docs/examples.md` — usage examples in consuming apps

---

## shadcn CLI alongside this package

New primitives belong in this package, not in either app. `apps/admin` has no CLI config. `apps/web/components.json` is the shadcn config for the monorepo: its `ui` and `components` aliases are `@balanse/ui`, while `utils` / `lib` / `hooks` stay on the web app's existing `@/lib` and `@/hooks` trees.

```bash
pnpm --filter web exec shadcn add <component>
```

Treat CLI output as a draft. Relocate the generated file into `src/components/<kebab-name>/`, add a `.meta.ts` contract and story, and export it from `src/index.ts`. Do not keep a parallel `components/ui` tree in `apps/web` or `apps/admin`.

See `docs/styling-and-design-system.md` and `packages/ui/docs/development.md`.

---

## Common task routing

| Task | Read next |
|---|---|
| Add a component | `packages/ui/docs/development.md`, `docs/template/COMPONENTS.md` |
| Use a component | `docs/component-guide.md`, `packages/ui/docs/examples.md` |
| Change an API | `packages/ui/docs/api.md`, then search all consumers |
| Styling | `docs/styling-and-design-system.md` |
