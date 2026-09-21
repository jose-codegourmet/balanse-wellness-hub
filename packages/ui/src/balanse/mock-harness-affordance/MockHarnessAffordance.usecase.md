# MockHarnessAffordance — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Collapsed mock-session-harness trigger: an icon-only tab on the right edge of the viewport. Shared by `apps/web` and `apps/admin` so the chrome stays identical. Not production UI.

## When to use

- The collapsed state of `MockSessionHarness` in either app
- Storybook review of the side tab at 360 / 768 / 1280

## When NOT to use

- Shipping / production chrome — the harness is gated by `NEXT_PUBLIC_ENABLE_MOCK_HARNESS`
- A text-labelled pill or a top-of-page control
- A draggable / repositionable affordance

## Examples

```tsx
{collapsed ? (
  <MockHarnessAffordance
    ref={triggerRef}
    panelId={HARNESS_PANEL_ID}
    onClick={() => persistCollapsed(false)}
  />
) : null}
```

## Gotchas

- Icon only — do not pass visible children or a text label.
- Hit target is `size-11` (44×44). Resting state is translucent (`bg-accent/40` + `opacity-60`); hover / focus / active go fully opaque.
- Position is `fixed right-0 top-1/2` so it stays clear of the admin left sidebar, sticky `FormActions`, and the customer portal bottom chrome.
- `aria-expanded` is `false` because this control only renders while collapsed. The expanded panel owns the Hide control.
