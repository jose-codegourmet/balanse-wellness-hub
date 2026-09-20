# ConfirmAction — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

App-wide confirm chrome for destructive or irreversible mock writes. Not a form control — `RosterPage` and payment queues use it outside any form.

## When to use

- Approve / reject / disable / refund actions that already used `ConfirmAction`
- Reject / cancel paths that need a typed reason (`requireReason`)
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

<ConfirmAction
  triggerLabel="Reject"
  title="Reject this request?"
  description="The customer stays on their current status."
  requireReason
  variant="destructive"
  onConfirm={(reason) => reject(reason ?? "")}
/>
```

## Gotchas

- `onConfirm` still works with zero-argument callbacks. `reason` is only passed when `requireReason` is true.
- Do not change existing call-site JSX unless that page ticket owns the reason move.
