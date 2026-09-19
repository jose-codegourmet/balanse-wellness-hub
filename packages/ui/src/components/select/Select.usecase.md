# Select — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Composable single-value dropdown with portal-positioned popup, groups, and scroll arrows.

## When to use

- Picking one option from a fixed list
- Grouped option lists with labels and separators

## When NOT to use

- Typeahead / chips → use **Combobox** instead
- Native OS picker → use **NativeSelect** instead
- Navigational actions → use **DropdownMenu** instead

## Examples

### Basic select

```tsx
<Select>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

### Grouped options

```tsx
<Select defaultValue="dog">
  <SelectTrigger className="w-[220px]">
    <SelectValue placeholder="Choose a class" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Pets</SelectLabel>
      <SelectItem value="dog">Dog</SelectItem>
      <SelectItem value="cat">Cat</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectLabel>Other</SelectLabel>
      <SelectItem value="fish">Fish</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

## Gotchas

- `"use client"` required; compose Select → Trigger/Value + Content/Item.
