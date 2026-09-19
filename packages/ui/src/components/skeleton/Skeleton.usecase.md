# Skeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Pulsing muted placeholder block for loading UI.

## When to use

- Placeholder lines/circles/cards while data loads
- Composing multiple skeletons to mimic a layout

## When NOT to use

- Active indeterminate spinner → use **Spinner** instead
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

## Gotchas

- Server-safe (no `"use client"`); size is entirely class-driven.
