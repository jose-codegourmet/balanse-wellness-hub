# UseBreakpoint — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

One source of truth for “which Balansé breakpoint am I at?” Built on `useMediaQuery` and `BALANSE_BREAKPOINTS` (360 / 768 / 1280).

| Hook | Returns |
| --- | --- |
| `useBreakpoint()` | `"mobile"` \| `"tablet"` \| `"desktop"` |
| `useMinWidth(px)` | `true` when `min-width` matches |
| `useIsMobile()` | `true` below the tablet breakpoint (768) |

The hooks have no props and render nothing. Storybook ships a tiny readout so reviewers can confirm: mobile at 360, tablet at 768, desktop at 1280.

## When to use

- JS that must switch calendar view, table-as-list, or wizard layout at the same widths as Storybook
- Replacing a local `window.innerWidth` / `matchMedia` listener

## When NOT to use

- Pure CSS layout — use Tailwind `md:` / `xl:` (768 / 1280)
- Container queries
- Changing the breakpoint numbers themselves — those live in `@balanse/config`

## Examples

```tsx
const breakpoint = useBreakpoint();
const view = breakpoint === "desktop" ? "month" : breakpoint === "tablet" ? "week" : "day";
```

```tsx
const mdUp = useMinWidth(BALANSE_BREAKPOINTS.tablet);
```

## Gotchas

- `"use client"`.
- First paint is `mobile` / `useMinWidth` `false` (server snapshot), then the live value settles. That avoids a hydration mismatch.
- `useIsMobile()` is `!useMinWidth(768)`, not a `max-width: 360` check. 361–767 stays mobile.
- Do not add a second `resize` listener beside this hook.
