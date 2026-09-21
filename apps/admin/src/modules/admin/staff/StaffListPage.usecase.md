# StaffListPage — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Admin staff directory. Role text comes from `staffCapabilityLabel` (`Admin` / `Admin · Coach`). The Coach facet filters the `isCoach` capability — not a `StaffRole`.

## When to use

- `/staff`

## When NOT to use

- Coach roster (`/coaches`) — teaching profiles, including coaches with no staff account
- Public / customer surfaces

## Examples

```tsx
<StaffListPage />
```

## Gotchas

- `isCoach` is a capability derived from the staff ↔ coach link (BE-055). Do not add a `COACH` role.
- Linked coaches reuse `CoachOption` / `CoachPhoto` for the avatar. Staff without a coach have no avatar.
- Coach rates never appear here.
- Data only via `getMockAdapter()` / `adminStaffQuery` + `adminCoachesQuery`.
