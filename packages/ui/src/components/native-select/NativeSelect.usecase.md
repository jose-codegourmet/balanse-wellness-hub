# NativeSelect — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Styled wrapper around the browser’s native `<select>` with a chevron.

## When to use

- Simple forms where native OS picker UX is fine
- Grouped options with `NativeSelectOptGroup`

## When NOT to use

- Custom option UI or search → use **Select** / **Combobox** instead

## Examples

### Basic select

```tsx
<NativeSelect defaultValue="medium">
  <NativeSelectOption value="small">Small</NativeSelectOption>
  <NativeSelectOption value="medium">Medium</NativeSelectOption>
  <NativeSelectOption value="large">Large</NativeSelectOption>
</NativeSelect>
```

### Grouped options

```tsx
<NativeSelect defaultValue="dog">
  <NativeSelectOptGroup label="Pets">
    <NativeSelectOption value="dog">Dog</NativeSelectOption>
    <NativeSelectOption value="cat">Cat</NativeSelectOption>
  </NativeSelectOptGroup>
  <NativeSelectOptGroup label="Other">
    <NativeSelectOption value="bird">Bird</NativeSelectOption>
  </NativeSelectOptGroup>
</NativeSelect>
```

## Gotchas

- Visual `size` prop is not HTML `size`; supports `aria-invalid` styling
