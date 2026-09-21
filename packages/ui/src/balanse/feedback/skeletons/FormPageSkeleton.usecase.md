# FormPageSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Form loading shell that matches `AdminForm`: full-bleed fields on mobile, constrained `md:max-w-2xl` column on tablet/desktop, optional tab-strip on `md+`, and a sticky action bar below `md`.

## When to use

- `/settings`, create/edit forms, staff/class/coach editors

## When NOT to use

- Pending-mutation affordances — those belong with the form kit (`FE-ADM-019`)

## Shape props

`label` (required), `sections` (default 2), `fields` (per section, default 3), optional `tabs` (`true` → 4 chips, or a count). Tab placeholders hide below `md`.

## Accessibility

One live region. No `Spinner`.
