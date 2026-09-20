# FormPageSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Settings-shaped form shell: `max-w-2xl`, section headings, labelled field rows (`gap-1.5` + `h-8` inputs), footer action.

## When to use

- `/settings`, create/edit forms, staff/class editors

## When NOT to use

- Pending-mutation affordances — those belong with the form kit (`FE-ADM-019`)

## Shape props

`label` (required), `sections` (default 2), `fields` (per section, default 3).

## Accessibility

One live region. No `Spinner`.
