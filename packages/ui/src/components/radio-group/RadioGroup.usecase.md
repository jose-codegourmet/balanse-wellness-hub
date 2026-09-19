# RadioGroup — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Mutually exclusive radio options with accessible keyboard behavior.

## When to use

- Single-choice settings (density, plan billing)
- Options with helper text beside Label

## When NOT to use

- Multi-select → use **Checkbox** instead
- Many options in a compact trigger → use **Select** / **NativeSelect** instead

## Examples

### Density options

```tsx
<RadioGroup defaultValue="comfortable">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="default" id="rg-default" />
    <Label htmlFor="rg-default">Default</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="comfortable" id="rg-comfortable" />
    <Label htmlFor="rg-comfortable">Comfortable</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="compact" id="rg-compact" />
    <Label htmlFor="rg-compact">Compact</Label>
  </div>
</RadioGroup>
```

### With helper text

```tsx
<RadioGroup defaultValue="monthly" className="max-w-sm gap-3">
  <div className="flex items-start gap-2">
    <RadioGroupItem value="monthly" id="rg-monthly" className="mt-0.5" />
    <div className="grid gap-1">
      <Label htmlFor="rg-monthly">Monthly</Label>
      <p className="text-sm text-muted-foreground">Billed every month. Cancel anytime.</p>
    </div>
  </div>
</RadioGroup>
```

## Gotchas

- `"use client"`; pair each item with `Label htmlFor={id}`
