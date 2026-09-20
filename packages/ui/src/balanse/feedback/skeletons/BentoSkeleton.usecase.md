# BentoSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Dashboard loading shell. Copies `/dashboard` column spans and band order: header → stat strip (`md:grid-cols-2 xl:grid-cols-5`) → Needs Attention → Today's Schedule table → metric tiles (`md:grid-cols-2 xl:grid-cols-4`).

## When to use

- Admin `/dashboard` `loading.tsx` and the dashboard early-return

## Shape props

`label` (required), `tiles` (default 4). No data.

## Accessibility

One `role="status"` region. Bars `aria-hidden`.
