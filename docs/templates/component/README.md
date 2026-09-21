# Component scaffold

Copy this directory into the destination (`packages/ui/src/components/<kebab-name>/` or `apps/<app>/src/components/balanse/<kebab-name>/`), then rename and drop the suffix.

## Why `.template`

`docs/**` is outside Biome's `files.includes` and outside every package `tsconfig`. Real `.ts` / `.tsx` files placed here would look like source while being invisible to `pnpm lint` and `pnpm typecheck`, and would rot. The `.template` suffix keeps the stubs inert.

## Substitution table

Replace every occurrence. Do not leave angle-bracket placeholders in the copied files.

| Token in stubs | Meaning | Example (`ScrollArea`) |
| --- | --- | --- |
| `Component` | PascalCase component name | `ScrollArea` |
| `component` | camelCase identifier prefix | `scrollArea` |
| `kebab-name` | folder name | `scroll-area` |

Also replace the story `title` namespace (`Components/Component` → `Components/ScrollArea`, or `Shared/` / `Foundation/` / `Admin/` as in `docs/component-guide.md`).

## Steps

1. Copy `docs/templates/component/` to the target folder (omit this `README.md`).
2. Rename `Component.*` → `PascalCase.*` and drop `.template`.
3. Search-replace `Component` / `component` using the table above.
4. Delete the zod block in `Component.schema.ts` if the component is **not** a form or value-owning form control. Do not leave an unused `zod` import.
5. Decide `"use client"` (only for state, effects, refs, context, or a client-only primitive).
6. Fill defaults with a real, story-ready configuration — not `children: "Example"`.
7. Add a barrel export in `packages/ui/src/index.ts` **only** when shipping a new public `@balanse/ui` primitive (append-only). Do not export props/defaults unless an outside consumer needs them.
8. Keep the `.meta.ts` contract next to the component implementation.
9. Run `pnpm --filter @balanse/ui typecheck && pnpm lint`. Story edits also need `pnpm build-storybook`.

Full rules: [`docs/component-guide.md`](../../component-guide.md).
