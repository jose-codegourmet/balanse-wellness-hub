# OptionRow — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Shared rich-option chrome for Combobox, Select, and CheckboxGroup: a reserved 28px leading slot plus an optional muted second line. Images load inside the reserved box so the list does not reflow.

## When to use

- Coach / customer / class pickers that need an avatar or mark next to the label
- Closed trigger state that should stay recognizable after selection (`compact`)

## When NOT to use

- Flat `{ value, label }` lists — render the label string only
- Grouped option headers

## Examples

```tsx
<OptionRow
  leading={<Avatar size="sm"><AvatarFallback>MS</AvatarFallback></Avatar>}
  label="Maya Santos"
  description="Reformer · senior coach"
/>
```

`compact` hides the description for trigger/selected surfaces.

## Gotchas

- `leading` is decorative (`aria-hidden`). The accessible name stays the label; wire `description` with `aria-describedby` on the option.
- Search/filter on `label` + `description` via `choiceOptionFilterText` — never on the leading node.
- Reserved leading box is `size-7` (28px). Pass `reserveLeading` when a list mixes items with and without media.
