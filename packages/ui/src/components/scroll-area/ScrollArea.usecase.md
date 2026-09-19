# ScrollArea — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Custom-scrollbar overflow container for clipped content.

## When to use

- Fixed-height lists that overflow
- Horizontal chip/tag rows (add horizontal `ScrollBar`)

## When NOT to use

- Chat autoscroll / stick-to-bottom → use **MessageScroller** instead
- Full-page document scrolling → use native page scroll

## Examples

### Vertical list

```tsx
<ScrollArea className="h-48 w-48 rounded-xl border">
  <div className="space-y-2 p-4">
    {tags.map((tag) => (
      <div key={tag} className="text-sm">
        {tag}
      </div>
    ))}
  </div>
</ScrollArea>
```

### Horizontal chips

```tsx
<ScrollArea className="w-96 rounded-xl border whitespace-nowrap">
  <div className="flex w-max gap-4 p-4">
    {tags.map((tag) => (
      <div key={tag} className="rounded-lg border px-3 py-1 text-sm">
        {tag}
      </div>
    ))}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```

## Gotchas

- `"use client"`; needs a constrained size (e.g. `h-48`); root always injects a vertical `ScrollBar`
