# AdminSidebarNav — Use Cases

> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

## Purpose

Renders `ADMIN_NAV_ITEMS` in Operations / Directory / Studio groups with `CountBadge` counts.

## When to use

- Inside `AdminSidebar` or `AdminSidebarMobile`
- Whenever the admin nav catalogue should stay byte-identical to `FE-SHR-001`

## When NOT to use

- Adding, removing, renaming, or reordering destinations
- Public or customer navigation

## Examples

```tsx
<AdminSidebarNav pathname="/payments" snapshot={snapshot} collapsed />
```

## Gotchas

- Active state is `isAdminNavActive(item, pathname)` only.
- Collapsed labels live in a `Tooltip` (hover and keyboard focus) and `sr-only` text.
- Group names stay on the `<ul>` via `aria-labelledby` when the visible label is hidden.
