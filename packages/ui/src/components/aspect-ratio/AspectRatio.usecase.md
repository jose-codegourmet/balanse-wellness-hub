# AspectRatio — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Wrapper that locks children to a numeric width/height ratio via CSS `aspect-ratio`.

## When to use

- Video/thumbnail placeholders at 16:9
- Square product crops at `ratio={1}`
- Consistent media frames inside responsive widths

## When NOT to use

- Circular user images with fallback → use **Avatar** instead
- File upload chips → use **Attachment** instead
- Full content sections → use **Card** instead

## Examples

### 16:9 media frame

The parent must constrain the width; `ratio` handles the height.

```tsx
import { AspectRatio } from "@balanse/ui";

<div className="w-[480px]">
  <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-muted">
    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
      16:9
    </div>
  </AspectRatio>
</div>;
```

### Square crop

Pass `ratio={1}` for thumbnails and product tiles.

```tsx
<div className="w-64">
  <AspectRatio ratio={1} className="overflow-hidden rounded-lg bg-muted">
    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
      1:1
    </div>
  </AspectRatio>
</div>
```

## Gotchas

- Parent must constrain width
- `ratio` is required
