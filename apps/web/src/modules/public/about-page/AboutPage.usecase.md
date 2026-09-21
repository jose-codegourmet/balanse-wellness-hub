# AboutPage — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Introduce Balansé through community imagery, approach, class families, coach previews, and booking steps.

## When to use

The public `/about` route and its Storybook preview.

## When NOT to use

The complete coach directory or booking calendar.

## Examples

Pass `coaches` from `getMockAdapter().getPublicCoaches()` to `AboutPage`.

## Gotchas

The first three supplied coaches are previewed; the directory link exposes the full roster. Photos use the asset manifest and coach records. Booking remains Calendar → Reserve → Pay → Confirm, with studio confirmation after payment. Shared ScrollReveal respects reduced motion. The former module path remains a compatibility export.
