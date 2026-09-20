# AdminSidebarToggle — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Header control that expands or collapses the desktop admin sidebar rail.

## When to use

- Desktop admin shell chrome (`≥ 768px`)
- Pair with `useSidebarCollapsed` so the choice persists

## When NOT to use

- Mobile navigation — use `AdminSidebarMobile` / `Sheet`
- Customer portal chrome — out of scope for this ticket

## Examples

```tsx
<AdminSidebarToggle
  collapsed={collapsed}
  onToggle={toggleCollapsed}
  controlsId={navId}
/>
```

## Gotchas

- Accessible name is `Collapse sidebar` / `Expand sidebar` only. `⌘B` belongs in the tooltip, not `aria-label`.
- `aria-controls` must point at the nav region id.
