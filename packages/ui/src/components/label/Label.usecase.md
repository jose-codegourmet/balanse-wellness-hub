# Label — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Accessible form field label styled for inputs and peers.

## When to use

- Pair with Input / NativeSelect / RadioGroupItem via `htmlFor` / `id`

## When NOT to use

- Non-form headings → use typography / **Marker** instead

## Examples

### With input

```tsx
<div className="grid max-w-sm gap-2">
  <Label htmlFor="email">Email address</Label>
  <Input id="email" type="email" placeholder="name@example.com" />
</div>
```

### Required field

```tsx
<div className="grid max-w-sm gap-2">
  <Label htmlFor="required-email">
    Email address <span className="text-destructive">*</span>
  </Label>
  <Input id="required-email" type="email" required />
</div>
```

## Gotchas

- `"use client"`; responds to `group-data-[disabled=true]` and `peer-disabled:`
