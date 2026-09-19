# Popover — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Anchored floating panel for short interactive content (settings, share, filters).

## When to use

- Non-modal overlays with small forms/filters
- “Share link” panels with title/description

## When NOT to use

- Brief hover hints → use **Tooltip** instead
- Blocking dialogs → use **Dialog** instead
- Site nav flyouts → use **NavigationMenu** instead

## Examples

### Simple panel

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
  <PopoverContent className="w-80">
    <p className="text-sm text-muted-foreground">
      Place content here such as settings, filters, or quick actions.
    </p>
  </PopoverContent>
</Popover>
```

### Share panel with header

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>Share profile</PopoverTrigger>
  <PopoverContent className="w-80">
    <PopoverHeader>
      <PopoverTitle>Share link</PopoverTitle>
      <PopoverDescription>Anyone with this link can view your class profile.</PopoverDescription>
    </PopoverHeader>
    <div className="flex gap-2">
      <Input readOnly defaultValue="https://balanse.app/p/bailey" />
      <Button size="sm">Copy</Button>
    </div>
  </PopoverContent>
</Popover>
```

## Gotchas

- `"use client"`; default width `w-72`
