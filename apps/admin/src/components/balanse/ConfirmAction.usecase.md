# ConfirmAction — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

App-wide confirm chrome for destructive or irreversible mock writes. Not a form control — `RosterPage` and payment queues use it outside any form.

## When to use

- Approve / reject / disable / refund actions that already used `shared.ConfirmAction`
- Form cancel only when a trigger-button shape fits; otherwise drive `AlertDialog` from `useUnsavedChangesGuard`

## When NOT to use

- Field-level validation
- Navigation the App Router cannot block (sidebar, breadcrumbs)

## Examples

```tsx
<ConfirmAction
  triggerLabel="Disable Access"
  title="Disable staff access?"
  description="This staff account will no longer reach the admin portal."
  variant="outline"
  onConfirm={() => disable()}
/>
```

## Gotchas

- Props match the previous `modules/admin/shared` export. Do not change call-site JSX.
