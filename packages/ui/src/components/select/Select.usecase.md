# Select — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Composable single-value dropdown with portal-positioned popup, groups, and scroll arrows.

## When to use

| Situation | Use |
| --- | --- |
| Short admin enum pickers (status, type, 2–8 options) | **NativeSelect** |
| Searchable or long lists | **Select** |

Use Select when you need custom option UI, grouping, or a portal menu. Do not delete NativeSelect.

## When NOT to use

- Typeahead / chips → use **Combobox** instead
- Native OS picker for a short enum → use **NativeSelect** instead
- Navigational actions → use **DropdownMenu** instead

## Examples

### Size and invalid

`SelectTrigger` accepts `size` (`sm | default | md | lg`) and `invalid`. `md` matches `default` (`h-8`).

```tsx
<Select>
  <SelectTrigger size="md" className="w-[200px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectContent>
</Select>
```

## Gotchas

- `"use client"` required; compose Select → Trigger/Value + Content/Item.
- Trigger reads `useFieldContext()` for `aria-invalid` / `aria-describedby`.
- Value schema: `selectSchema` is `z.string()`.
- 44px mobile touch target: `className="max-sm:min-h-11"` on `SelectTrigger`.
