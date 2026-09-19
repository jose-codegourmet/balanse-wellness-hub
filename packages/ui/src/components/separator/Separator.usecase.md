# Separator — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Thin visual divider for horizontal or vertical layout splits.

## When to use

- Dividing sections in a card, sidebar, or settings panel
- Vertical rule between inline controls

## When NOT to use

- Separating Select options → use **SelectSeparator** instead
- Gaps that don’t need a semantic divider → use spacing/`div` instead

## Examples

### Horizontal divider in a list

```tsx
<div className="max-w-sm space-y-4">
  <div>
    <p className="text-sm font-medium">Account</p>
    <p className="text-sm text-muted-foreground">Manage profile settings</p>
  </div>
  <Separator />
  <div>
    <p className="text-sm font-medium">Billing</p>
    <p className="text-sm text-muted-foreground">Invoices and payment methods</p>
  </div>
</div>
```

### Vertical rule

```tsx
<div className="flex h-20 items-center gap-4">
  <span className="text-sm">Left</span>
  <Separator orientation="vertical" />
  <span className="text-sm">Right</span>
</div>
```

## Gotchas

- `"use client"` required.
