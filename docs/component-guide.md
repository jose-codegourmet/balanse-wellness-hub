# Component authoring guide

## Purpose and scope

This is the target of the backlink in every `*.usecase.md` (`> Part of the [Component Usage Guide](…/docs/component-guide.md).`). It is the authoring contract for shared primitives in `@balanse/ui` and for app-local composition under `src/components/balanse/` (or `packages/ui/src/balanse/` when both apps need the same wrapper). Vendored Jabkit files are exempt — they keep their upstream shape.

This ticket publishes process only. It does not change rendered pixels.

## Where a component lives

| Situation | Home | How |
| --- | --- | --- |
| Shared cross-app primitive | `packages/ui/src/components/<kebab-name>/` | Hand-create the folder (or scaffold with shadcn from `apps/web` and move the output); export from `src/index.ts` |
| Marketing / app-shell block available upstream | `apps/<app>/src/components/jabkit/` | `npx @jabkit/cli add <name>` from the app dir; files stay **pristine** |
| Product composition of either | `apps/<app>/src/components/balanse/` (or `packages/ui/src/balanse/` when both apps need it) | Hand-written wrapper |

Do not hand-edit vendored Jabkit source unless a ticket explicitly requires a patch, and then record it. Vendored Jabkit keeps its own `*.types.ts` shape and is **exempt** from the required file set below (those files are also excluded from Biome). Registry URL and `jabkit.config.json` live in each app; see `docs/engineering/jabkit.md`.

Do not migrate existing mixed `@balanse/ui` / `@/components/jabkit/*` imports unless a ticket says so.

## Required file set

Every component added or materially changed from now on ships these five colocated files:

| File | Required? | Contents |
| --- | --- | --- |
| `Component.tsx` | Always | Implementation. Add `"use client"` only when the component uses state, effects, refs, context, or a client-only primitive. `Skeleton` is server-safe and must stay so. `ScrollArea` is client. |
| `Component.schema.ts` | Always | Exported props type. A runtime `zod` schema only when [schema rules](#componentschemats-rules) require it. |
| `Component.defaults.ts` | Always | Exported defaults, typed from the schema file — never redeclare the type. |
| `Component.stories.tsx` | Always | Storybook `meta` plus one story per meaningful state. |
| `Component.usecase.md` | Always | Purpose / When to use / When NOT to use / Examples / Gotchas, opening with the guide backlink. |

Copy-paste stubs: `docs/templates/component/`.

## Naming contract

Exact identifiers — no variation:

| Thing | Pattern | Example |
| --- | --- | --- |
| Folder | `kebab-case` | `scroll-area/` |
| Files | `PascalCase.*` | `ScrollArea.tsx` |
| Props type | `<Component>Props` | `SkeletonProps` |
| Zod schema (value) | `<component>Schema` | `bookingFormSchema` |
| Inferred value type | `<Component>Values = z.infer<typeof <component>Schema>` | `BookingFormValues` |
| Defaults | `<component>DefaultValues` | `skeletonDefaultValues` |

## `Component.schema.ts` rules

- Always export the props type. Derive it from the real render contract (`React.ComponentProps<"div">`, `SomePrimitive.Root.Props`, or a `VariantProps<typeof cva(...)>` intersection) rather than re-typing a narrower hand-written interface — a narrower type silently breaks consumers.
- A runtime `zod` schema is **required only** when the component is a form, or a form control that owns a value (`Input`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`, `NativeSelect`, `Select`, `DatePicker`, `RichTextarea`, …). Then the schema describes the **value**, not the props, and the props type derives from it where practical.
- **Never import `zod` in a schema file that exports no zod schema.** Lint will not catch it (`noUnusedImports` is off for `packages/ui/src/components/**`).
- Keep the file type-only where it can be — no runtime side effects for non-form components.

Non-form reference (`Skeleton`):

```ts
import type * as React from "react";

export type SkeletonProps = React.ComponentProps<"div">;
```

Form-control / form (value schema + inferred values):

```ts
import { z } from "zod";

export const bookingFormSchema = z.object({
  guestName: z.string().min(1),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
```

## `Component.defaults.ts` rules

- Non-form: `export const <component>DefaultValues: Partial<<Component>Props>` — the canonical, story-ready configuration (real classes/props), not placeholder text like `children: "Example"`.
- Form: the full `defaultValues` object typed as `<Component>Values`, consumed by both `useForm({ defaultValues })` and the story.
- Always `import type { … } from "./Component.schema"`.

```ts
import type { SkeletonProps } from "./Skeleton.schema";

export const skeletonDefaultValues: Partial<SkeletonProps> = {
  className: "h-4 w-[240px]",
};
```

## `Component.stories.tsx` — the `meta` shape

Canonical snippet the rest of the wave copies:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Component } from "./Component";
import { componentDefaultValues } from "./Component.defaults";

const meta: Meta<typeof Component> = {
  title: "Components/Component",
  component: Component,
  tags: ["autodocs"],
  args: { ...componentDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

Rules:

- **`title` namespace**

  | Location | Title prefix |
  | --- | --- |
  | `packages/ui/src/components/` | `Components/*` |
  | `packages/ui/src/balanse/` | `Shared/*` |
  | `packages/ui/src/brand/` (and similar foundation) | `Foundation/*` |
  | App screens / modules | `Admin/Screens/<Screen>`, `Customer/*`, `Marketing/*`, `Portal/*` |
  | `apps/admin/src/components/balanse/` | `Admin/Components/<Component>` |

- `tags: ["autodocs"]` always.
- Args come from `defaultValues` — **never re-typed inline**.
- A story that needs a different shape overrides via its own `args`. Any prop passed after `{...args}` in a `render` wins over the arg — do not both seed `className` in defaults and hardcode it in `render`.
- One story per meaningful state.
- a11y must stay green. For admin, run `pnpm --filter admin test-storybook` before shipping — the static Storybook build does not execute axe.
- Stories are excluded from `pnpm typecheck` (`packages/ui/tsconfig.json`). `pnpm build-storybook` is the only type gate for stories.

## `Component.usecase.md` shape

Required headings, in this order:

1. Opening backlink
2. `## Purpose`
3. `## When to use`
4. `## When NOT to use`
5. `## Examples`
6. `## Gotchas`

Backlink depths (already correct in the repo — do not “normalize” them):

- From `packages/ui/src/components/<name>/`: `../../../../../docs/component-guide.md`
- One extra `../` per extra nesting level (today: `components/table/data-table/` and `components/motion/scroll-reveal/` use six).

```md
# Component — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

…

## When to use

…

## When NOT to use

…

## Examples

…

## Gotchas

…
```

Examples use design tokens and utility classes only — no hardcoded hex colors.

## Form standard

- `react-hook-form` + `zodResolver` from `@hookform/resolvers/zod`.
- `schema` and `defaultValues` colocated with the form and exported. The story imports both instead of re-typing args.
- No `useState` form objects.
- Validation and server/mock errors surface through **`FieldError`** (`Field` family) or **`FormMessage`** (`Form` family) — never ad-hoc `<p>` tags.

Two existing families in `@balanse/ui` — do not invent a third:

| Family | Exports | Error surface |
| --- | --- | --- |
| `Form` | `Form` (= `FormProvider`), `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField` | `FormMessage` |
| `Field` | `Field`, `FieldContent`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLabel`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldTitle` | `FieldError` |

**Dependency note:** `packages/ui` has `react-hook-form` + `zod` but **not** `@hookform/resolvers`. `apps/admin` has all three. `apps/web` has `zod` only. A ticket that needs `@hookform/resolvers` in `packages/ui` or `apps/web` adds it there deliberately (`FE-SHR-008` / #199, `FE-ADM-019` / #209). Do not add that dependency from an unrelated ticket.

Admin forms use the admin form kit from `FE-ADM-019` (#209) once it lands.

## Barrel exports

The component is exported from `packages/ui/src/index.ts`. The props type and defaults are exported from the barrel **only when a consumer outside the package needs them**.

During this wave, `index.ts` is **append-only**: add a line when a new public component ships; do not reorder, reformat, or “clean up” the barrel in an unrelated ticket.

## When the standard applies

Every component added or *materially changed* from now on. Existing components are backfilled opportunistically by whichever ticket touches them; there is no mass-backfill ticket.

Reference implementations (already aligned): `packages/ui/src/components/skeleton/` and `packages/ui/src/components/scroll-area/`.

Vendored Jabkit under `src/components/jabkit/` stays pristine and is exempt.

## Author checklist

- [ ] Folder is `kebab-case`; files are `PascalCase.*`
- [ ] Five files: `.tsx`, `.schema.ts`, `.defaults.ts`, `.stories.tsx`, `.usecase.md`
- [ ] Props type is `<Component>Props` derived from the real render contract (not a narrower hand-written interface)
- [ ] Zod is imported only when this is a form or value-owning form control; schema is `<component>Schema`, values are `<Component>Values`
- [ ] Defaults are `<component>DefaultValues`, typed from `./Component.schema`, story-ready (no `children: "Example"`)
- [ ] Story `meta` uses `tags: ["autodocs"]` and `args: { ...defaultValues }`; `Default` is args-driven; one story per meaningful state
- [ ] Usecase opens with the guide backlink (correct `../` depth) and the five headings in order
- [ ] Forms: `react-hook-form` + `zodResolver`; errors via `FieldError` or `FormMessage`
- [ ] `"use client"` only when required; no hardcoded hex; barrel export only if the public API needs it
- [ ] `pnpm --filter @balanse/ui typecheck && pnpm lint` plus `pnpm build-storybook` for story changes

## See also

- Scaffold: [`docs/templates/component/`](./templates/component/)
- Jabkit: [`docs/engineering/jabkit.md`](./engineering/jabkit.md)
- FE screen checklist: [`docs/engineering/fe-screen-ticket-checklist.md`](./engineering/fe-screen-ticket-checklist.md)
- Package how-to: [`packages/ui/docs/development.md`](../packages/ui/docs/development.md)

## Changelog

### Admin polish wave 0 (`FE-SHR-007`–`012`, epic #197)

Primitives added or materially changed in `@balanse/ui` during this wave. Find them here instead of grepping:

| Primitive | Path | Ticket |
| --- | --- | --- |
| `DatePicker` | `packages/ui/src/components/date-picker/` | `FE-SHR-009` / #200 |
| `DateRangePicker` | same folder as `DatePicker` | `FE-SHR-009` / #200 |
| `TimePicker` | `packages/ui/src/components/time-picker/` | `FE-SHR-009` / #200 |
| `RichTextarea` | `packages/ui/src/components/rich-textarea/` | `FE-SHR-010` / #201 |
| `CountBadge` | `packages/ui/src/components/badge/CountBadge.tsx` | `FE-SHR-011` / #202 |
| Page-skeleton shells | `packages/ui/src/balanse/feedback/skeletons/` (`TablePageSkeleton`, `CardListSkeleton`, `FormPageSkeleton`, `BentoSkeleton`, `DetailPageSkeleton`, `CalendarSkeleton`) | `FE-SHR-012` / #203 |

`Badge` and `StatusBadge` were redesigned in place (`FE-SHR-011` / #202). Field primitives (`Button`, `Field`, `Input`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`, `NativeSelect`) were hardened in `FE-SHR-008` / #199. Wave closeout: `docs/metas/fe-admin-polish.md`.

## Control surface recipe

Every new or changed form control in `@balanse/ui` must compose the shared recipe in `packages/ui/src/lib/control-surface.ts` (`controlSurfaceVariants`, `textareaSurfaceVariants`, `controlSurfaceGroup`, `controlSurfaceChips`, `controlIndicatorStates`). That file owns resting border, background, radius, shadow, `sm` / `md` / `lg` heights, horizontal padding, placeholder colour, and `hover` / `focus-visible` / `aria-invalid` / `disabled` / `readonly`.

Rules:

- Controls are `w-full` by default. The layout constrains width — do not ship `w-fit` on a trigger or native select wrapper.
- Text-like controls use `controlSurfaceVariants`. Input groups and chip fields use the group/chips helpers. Checkbox, Switch, and Radio keep their own geometry but must use `controlIndicatorStates` for colour, focus, and invalid.
- Route `aria-invalid` / `aria-describedby` through `useFieldContext()` so `FieldError` drives the same red ring. Keep explicit props working for context-free use.
- Field child order is **label → control → description → error**.

### Admin polish wave 2 Batch A (`FE-SHR-014`, `FE-SHR-018`)

| Primitive | Path | Ticket |
| --- | --- | --- |
| `useMediaQuery` | `packages/ui/src/hooks/use-media-query/` | `FE-SHR-014` / #261 |
| `useBreakpoint` / `useMinWidth` / `useIsMobile` | `packages/ui/src/hooks/use-breakpoint/` | `FE-SHR-014` / #261 |
| `MockHarnessAffordance` | `packages/ui/src/balanse/mock-harness-affordance/` | `FE-SHR-018` / #262 |

### Admin polish wave 2 Batch B (`FE-SHR-015`–`017`)

| Primitive | Path | Ticket |
| --- | --- | --- |
| Responsive page skeletons | `packages/ui/src/balanse/feedback/skeletons/` | `FE-SHR-015` / #263 |
| Control surface recipe | `packages/ui/src/lib/control-surface.ts` | `FE-SHR-016` / #264 |
| Field gallery stories | `packages/ui/src/components/field/FieldGallery.stories.tsx` | `FE-SHR-016` / #264 |
| `OptionRow` / `ChoiceOption` | `packages/ui/src/components/option-row/` | `FE-SHR-017` / #265 |
| Rich Combobox / Select / CheckboxGroup | `packages/ui/src/components/{combobox,select,checkbox}/` | `FE-SHR-017` / #265 |
