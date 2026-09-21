# Combobox — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Searchable single- or multi-value picker. Options may stay flat `{ value, label }` or add optional `leading` / `description` for recognizable rows.

## When to use

- Long searchable lists (coaches, customers, classes)
- When the closed trigger should keep a selected avatar (`leading` on `ComboboxInput`)

## When NOT to use

- Short enums → **NativeSelect** or **Select**
- Independent multi-check rows → **CheckboxGroup**

## Examples

### Flat options

```tsx
<Combobox items={["Reformer", "Tower"]} itemToStringLabel={(item) => item}>
  <ComboboxInput placeholder="Search…" />
  <ComboboxContent>
    <ComboboxList>
      <ComboboxCollection>
        {(item) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxCollection>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

### Rich options

Pass `leading` and `description` on `ComboboxItem`. Filter with `choiceOptionFilterText` so search matches label + description, never the leading node. Repeat `leading` on `ComboboxInput` so the closed trigger stays recognizable.

## Gotchas

- `"use client"` required.
- `ComboboxInput` is `w-full` by default (FE-SHR-016). Constrain the layout, not the control.
- `leading` is decorative (`aria-hidden`). `description` is `aria-describedby` on the option.
