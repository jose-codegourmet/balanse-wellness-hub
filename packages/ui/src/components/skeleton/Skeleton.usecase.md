# Skeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Pulsing muted placeholder block for loading UI. The default path is still a single bar: size is entirely class-driven.

## Variants

| Variant | Role |
| --- | --- |
| *(none)* | Single bar — same as today. Use `className` for size. |
| `text` | Line stack. `lines` shortens the last bar. Caps at 8, same as `LocalizedSkeleton`. |
| `heading` | Wider title bar. |
| `circle` | Avatar. |
| `rect` | Media block. Pass `aspect` (`"16 / 9"` or `1.5`). |
| `block` | Large content slab. |

## Motion

Pulse uses `motion-safe:animate-pulse` (not a bare `animate-pulse`). That is the house rule for new skeleton work: honor `prefers-reduced-motion` via Tailwind `motion-safe:` / `motion-reduce:`. Do not add `"use client"` — this file must stay server-safe for `loading.tsx`.

## When to use

- Placeholder lines/circles/cards while data loads
- Composing page shells in `balanse/feedback/skeletons/` for whole-page loading

## When NOT to use

- Active indeterminate spinner → use **Spinner** instead (inline/button only)
- Whole admin pages → prefer a page shell (`TablePageSkeleton`, `CardListSkeleton`, …)
- Real interactive content → keep real components (disabled)

## Examples

### Line placeholder

```tsx
<Skeleton className="h-4 w-[240px]" />
```

### Avatar + text block

```tsx
<div className="flex max-w-sm items-center gap-4">
  <Skeleton className="size-12 shrink-0 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[200px]" />
    <Skeleton className="h-4 w-[160px]" />
    <Skeleton className="h-4 w-[120px]" />
  </div>
</div>
```

### Text variant

```tsx
<Skeleton variant="text" lines={3} />
```

## Gotchas

- Server-safe (no `"use client"`); default rendering stays a single `data-slot="skeleton"` bar.
- `LocalizedSkeleton` is still valid for inline stacks, but it silently caps at 8 lines.
- Authoring: this folder is the reference implementation of the five-file set in `docs/component-guide.md`.
