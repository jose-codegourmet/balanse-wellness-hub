# UseMediaQuery — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

SSR-safe `window.matchMedia` hook. The server snapshot and the first client paint are `false`, then the live match settles. One listener, cleaned up on unmount or query change.

The hook has no props and renders nothing. Storybook ships a tiny readout so reviewers can see the boolean at the 360 / 768 / 1280 viewport presets.

## When to use

- Any client code that needs a CSS media query, including `prefers-reduced-motion` later
- Building `useMinWidth` / `useBreakpoint` / `useIsMobile` — import those instead when the question is “which Balansé breakpoint am I on?”

## When NOT to use

- Tailwind `md:` / `lg:` layout that does not need a JS branch
- Container queries — this hook is viewport-only
- Polling `window.innerWidth` on resize; subscribe through this hook instead

## Examples

```tsx
const tabletUp = useMediaQuery("(min-width: 768px)");
```

```tsx
const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
```

## Gotchas

- `"use client"` — do not import from a server component.
- First paint is always `false` (server snapshot). Do not treat that as “the viewport is mobile” until after hydrate if the query is not a `min-width` check.
- `getServerSnapshot` is hard-coded `false` so React will not warn about a hydration mismatch.
