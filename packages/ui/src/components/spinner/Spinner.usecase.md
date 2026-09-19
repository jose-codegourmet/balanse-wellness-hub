# Spinner — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Spinning `Loader2Icon` loading indicator with `role="status"` and `aria-label="Loading"`.

## When to use

- Inline loading next to a label or button
- Small indeterminate wait states

## When NOT to use

- Content-shaped placeholders → use **Skeleton** instead
- Toast-level async status → use Sonner `toast.loading` instead

## Examples

### Default

```tsx
<Spinner />
```

### With label

```tsx
<div className="flex items-center gap-2">
  <Spinner />
  <span className="text-sm text-muted-foreground">Loading...</span>
</div>
```

## Gotchas

- Presentational only (no progress value); override size via `className` (e.g. `size-8`).
