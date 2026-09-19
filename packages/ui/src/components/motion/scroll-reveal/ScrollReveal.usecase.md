# ScrollReveal — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Fade/slide-in animation when children enter the viewport (Framer Motion).

## When to use

- Landing-page sections that reveal on scroll
- Staggered reveals via different `delay` values

## When NOT to use

- Page transitions, looping animations → not allowed in this template (see PATTERNS)

## Examples

### Default (from below)

```tsx
<ScrollReveal>
  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
    <h3 className="font-display text-xl font-semibold">Revealed content</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      This block animates into view with a subtle fade and slide.
    </p>
  </div>
</ScrollReveal>
```

### From left

```tsx
<ScrollReveal direction="left">
  <div className="rounded-xl border p-6">Slide in from the left</div>
</ScrollReveal>
```

## Gotchas

- `"use client"`; respects `prefers-reduced-motion` (static fallback)
