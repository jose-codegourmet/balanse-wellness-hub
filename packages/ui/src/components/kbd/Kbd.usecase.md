# Kbd — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Styles a native `<kbd>` element (and grouped wrapper) to display keyboard shortcuts.

## When to use

- Shortcut hints next to menu items (`⌘K`)
- Modifier chords with `KbdGroup`

## When NOT to use

- Interactive controls → use **Button** instead
- Hotkey binding UI — this is display-only

## Examples

### Single key

```tsx
<Kbd>K</Kbd>
```

### Modifier chord

```tsx
<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>
```

## Gotchas

- `pointer-events-none` / `select-none`
- `KbdGroup` is typed as a `div` but renders a `<kbd>`
