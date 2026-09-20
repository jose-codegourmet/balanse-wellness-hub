# AdminPageTabs — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Admin page tab strip with the `@balanse/ui` Tabs ARIA contract. Used by `/bookings` and `/payments`.

## When to use

- Mutually exclusive queues or filters that are already modelled as tabs (`ADMIN_BOOKING_TABS`, `AdminPaymentTab`)
- Any admin screen that needs a labelled tablist plus one panel

## When NOT to use

- Independent filters (checkboxes, date fields)
- Navigation between routes — use links
- A single view with no alternate panel

## Examples

```tsx
<AdminPageTabs
  tabs={ADMIN_BOOKING_TABS}
  value={tab}
  onValueChange={(id) => setTab(id as AdminBookingTab)}
>
  <AdminDataTable ... />
</AdminPageTabs>
```

## Gotchas

- Keep tab **ids and labels** from `@balanse/domain` (or the existing local payment `TABS` const). Do not rename them here.
- Put the filtered table (or queue) in `AdminPageTabs` children so the active tab owns a `role="tabpanel"`.
- Seed `/bookings` from `?tab=` and leave other query keys (`tableId` prefixes from FE-ADM-017) alone.
- Active state must stay visible without colour: line indicator + heavier weight.
- Keyboard handling (Left/Right/Home/End, roving tabindex) is provided by Base UI — do not duplicate it.
