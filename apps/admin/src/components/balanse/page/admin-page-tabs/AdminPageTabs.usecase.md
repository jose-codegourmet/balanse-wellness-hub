# AdminPageTabs — Use Cases

> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

## Purpose

Admin page tab strip with the `@balanse/ui` Tabs ARIA contract. Line tabs at `md+`. Below `md`, a sticky horizontally scrolling chip row that **switches panels** (`mobileBehavior="tabs"`, default).

## When to use

- Mutually exclusive queues or filters (`ADMIN_BOOKING_TABS`, `AdminPaymentTab`)
- Coach profile and Settings sections
- Any admin screen that needs a labelled tablist plus one panel

## When NOT to use

- Independent filters (checkboxes, date fields)
- Navigation between routes — use links
- The class / session wizard — `AdminWizard` is a different pattern
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

```tsx
<AdminPageTabs
  mobileBehavior="tabs"
  tabs={tabs}
  value={tab}
  onValueChange={setTab}
  label="Coach profile"
/>
```

## Gotchas

- Keep tab **ids and labels** from `@balanse/domain` (or the existing local payment `TABS` const). Do not rename them here.
- Put the filtered table (or queue) in `AdminPageTabs` children so the active tab owns a `role="tabpanel"`. Coach / Settings keep fields mounted with `hidden` (not `hidden max-md:block`) so RHF values survive chip switches.
- Seed from `?tab=` via `useTabParam(param, tabs, defaultId)`.
- `tab.error` paints a destructive chip/dot. `onSubmitError` still jumps `?tab=` to the first invalid tab.
- `mobileBehavior="stack"` hides the tablist below `md` for screens that genuinely want a long scroll.
- Keyboard handling (Left/Right/Home/End, roving tabindex) is provided by Base UI — do not duplicate it.
