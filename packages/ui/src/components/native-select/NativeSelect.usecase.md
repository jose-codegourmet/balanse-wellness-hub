# NativeSelect — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Styled wrapper around the browser’s native `<select>` with a chevron.

## When to use

| Situation | Use |
| --- | --- |
| Short admin enum pickers (status, type, 2–8 options) | **NativeSelect** |
| Searchable or long lists | **Select** |

Also use NativeSelect when grouped `<optgroup>` options and native OS picker UX are enough.

## When NOT to use

- Custom option UI, virtualization, or typeahead → **Select** / **Combobox**
- Do not delete NativeSelect in favor of Select — both stay.

## Examples

### Basic select

`md` is the canonical size and an alias of `default` (`h-8`). `default` is deprecated but retained.

```tsx
<NativeSelect defaultValue="medium">
  <NativeSelectOption value="small">Small</NativeSelectOption>
  <NativeSelectOption value="medium">Medium</NativeSelectOption>
  <NativeSelectOption value="large">Large</NativeSelectOption>
</NativeSelect>
```

## Gotchas

- Visual `size` is not HTML `size`. Union: `sm | default | md | lg`.
- `invalid` (or `Field` context) sets `aria-invalid`.
- `"use client"` because it reads `useFieldContext()`.
- Value schema: `nativeSelectSchema` is `z.string()`.
- 44px mobile touch target: `className="max-sm:min-h-11"`.
