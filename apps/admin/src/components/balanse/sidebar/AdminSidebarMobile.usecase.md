# AdminSidebarMobile — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Mobile admin drawer built on `@balanse/ui` `Sheet`: focus trap, Escape, scroll lock, restore focus.

## When to use

- Viewports below `md` (`768px`)
- Pair with the desktop `aside` that stays `hidden md:flex`

## When NOT to use

- Desktop collapse — that is `useSidebarCollapsed` + `AdminSidebarToggle`
- A hand-rolled scrim `<button>`

## Examples

```tsx
<AdminSidebarMobile pathname={pathname} snapshot={snapshot} />
```

## Gotchas

- Uncontrolled mode closes on `pathname` change. Controlled `open` is for stories.
- Do not vendor a second Jabkit `sheet`.
