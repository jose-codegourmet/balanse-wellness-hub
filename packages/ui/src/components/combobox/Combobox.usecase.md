# Combobox — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Searchable, filterable select with optional chips/multi-select UI.

## When to use

- Large option lists that need typeahead
- Autocomplete / tag pickers; multi-value chips via `ComboboxChips`

## When NOT to use

- Simple fixed list, no search → use **Select** instead
- Native OS picker → use **NativeSelect** instead
- Global command palette → use **Command** instead

## Examples

### Searchable framework picker

Pass options via `items` and render each with `ComboboxCollection`.

```tsx
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@balanse/ui";

const frameworks = ["Next.js", "React", "Vue", "Svelte", "Astro"];

<Combobox items={frameworks}>
  <ComboboxInput placeholder="Select framework..." className="w-[240px]" />
  <ComboboxContent>
    <ComboboxEmpty>No framework found.</ComboboxEmpty>
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

## Gotchas

- `"use client"` required.
- Chip layouts often need `useComboboxAnchor` + `anchor` on Content.
