# Tooltip — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Hover/focus hint popup with portal, positioner, and arrow.

## When to use

- Short hints on icon buttons
- Clarifying truncated labels

## When NOT to use

- Longer interactive content → use **Popover** instead
- Critical always-visible info → use visible text / **Alert** instead

## Examples

### Default

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
    <TooltipContent>Add to library</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Side bottom

```tsx
<Tooltip>
  <TooltipTrigger render={<Button variant="outline" />}>Bottom tooltip</TooltipTrigger>
  <TooltipContent side="bottom">Displayed below the trigger</TooltipContent>
</Tooltip>
```

## Gotchas

- `"use client"`; wrap with `TooltipProvider`; content is non-interactive by design.
