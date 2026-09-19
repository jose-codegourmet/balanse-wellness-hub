# Progress — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Determinate progress bar with optional label and numeric value display.

## When to use

- Upload/processing indicators (`value={0–100}`)
- Labeled bars with `ProgressLabel` + `ProgressValue`

## When NOT to use

- Indeterminate loaders → use **Spinner** instead

## Examples

### Labeled upload

```tsx
<Progress value={25} className="max-w-sm">
  <ProgressLabel>Uploading</ProgressLabel>
  <ProgressValue />
</Progress>
```

### Bar only

```tsx
<Progress value={72} className="max-w-sm" />
```

## Gotchas

- `"use client"`; `Progress` always appends Track/Indicator after children — put Label/Value as children
