# StaffDetailPage — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Provision or edit a staff account with the #209 admin form kit. The coach switch is a capability (`isCoach`) that links or creates a teaching profile.

## When to use

- `/staff/[staffId]` and `/staff/new`

## When NOT to use

- Editing public bio, photo, or rates — that lives on `/coaches/[coachId]`
- Inventing a `COACH` `StaffRole`

## Examples

```tsx
<StaffDetailPage staffId="staff-rex" />
```

## Gotchas

- RHF + zod + `AdminForm` / `FormField` / bindings. Schema and defaults live in `forms/staff/`.
- Turning the flag on creates or links a coach. Turning it off unlinks and deactivates — it never deletes session history.
- Coach-only people (no staff) remain valid; they are not edited here.
- Coach rate fields must not appear on this form for any principal.
