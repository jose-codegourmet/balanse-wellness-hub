# `@balanse/ui` Development

How to add, change, and validate components in the shared UI package.

---

## Package structure

```text
packages/ui/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Public barrel — every export must be added here
│   ├── styles.css            # tw-animate-css import
│   ├── lib/utils.ts          # cn()
│   ├── hooks/                # useMediaQuery, useBreakpoint
│   └── components/
│       ├── button/
│       │   ├── Button.tsx
│       │   ├── Button.schema.ts
│       │   ├── Button.defaults.ts
│       │   ├── Button.stories.tsx
│       │   └── Button.usecase.md
│       └── ...
```

---

## Adding a new component

Prefer creating the kebab folder by hand. If you scaffold with the shadcn CLI, run it from `apps/web` (`pnpm --filter web exec shadcn add <name>`) using `apps/web/components.json`, then move the flat output into `src/components/[kebab-name]/` as below.

1. Create a folder under `src/components/[kebab-name]/`.
2. Add the component file `PascalCase.tsx`.
3. Add `PascalCase.schema.ts` (exported props type; plus a `zod` value schema when it is a form or form control).
4. Add `PascalCase.defaults.ts` (`<component>DefaultValues`, typed from the schema file).
5. Add a Storybook story `PascalCase.stories.tsx` (`meta.args` seeded from the defaults).
6. Add a use-case doc `PascalCase.usecase.md`.
7. Add an export line to `src/index.ts` (append-only).
8. Follow `docs/component-guide.md`; copy `docs/templates/component/`.
9. Run `pnpm --filter @balanse/ui typecheck` and `pnpm lint`.

Example folder:

```text
packages/ui/src/components/alert/
  ├── Alert.tsx
  ├── Alert.schema.ts
  ├── Alert.defaults.ts
  ├── Alert.stories.tsx
  └── Alert.usecase.md
```

---

## Component conventions

- Use Base UI primitives (`@base-ui/react`) as the foundation where possible.
- Use `class-variance-authority` for component variants.
- Use `cn()` from `src/lib/utils.ts` for conditional class merging.
- Keep components generic and composable. Do not add app-specific business logic.
- Forward refs where appropriate.
- Export subcomponents from the same file when they are meant to be used together.

---

## The `cn()` utility

`src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Apps also keep a local `cn()` in `src/lib/utils.ts`, but the package exports it for consumers that prefer one import source.

---

## Validation commands

| Command | Purpose |
|---|---|
| `pnpm --filter @balanse/ui typecheck` | TypeScript check |
| `pnpm --filter @balanse/ui lint` | Biome check for this package |
| `pnpm lint` | Biome across the whole repo |

---

## Tailwind scanning

Apps must include this in their `globals.css` for Tailwind to find classes in the package:

```css
@source "../../../../packages/ui/src/**/*.{ts,tsx}";
```

If a new component's classes are not applied, verify the `@source` directive is still present and points to the correct relative path.

---

## Storybook

Stories are co-located with components. They are consumed by `apps/web` Storybook. Run:

```bash
pnpm --filter web storybook
```

---

## Linting note

`packages/ui` is linted by Biome. `pnpm --filter @balanse/ui lint` runs `biome check .` using the root `biome.json`. The same rules also apply when you run `pnpm lint` from the repo root. This package does not use ESLint.
