# CoachStaffLink — Use Cases

> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

## Purpose

One-line staff-account affordance on a coach profile. Shows the linked staff member or states that the coach has no login.

## When to use

- Coach detail / public-profile tab (`FE-ADM-038`)
- Any admin surface that needs the BE-055 staff ↔ coach link without a new tab

## When NOT to use

- Staff list capability column (`staffCapabilityLabel`)
- Public / customer coach cards — `staffId` is admin-only

## Examples

```tsx
<CoachStaffLink staff={staff ?? null} />
```

## Gotchas

- A coach with no staff account is valid. Do not force a staff row.
- Unlinking must never delete the coach. Session history stays on the teaching profile.
- Data via `getMockAdapter()` / React Query — never import fixture files from screens.
