# AdminPageShell — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Stable admin page chrome: breadcrumb, title, optional description / eyebrow / actions / stats / tabs, and a content region. Route `loading.tsx` files reuse the same header so only the body swaps.

## When to use

- Every admin dashboard screen that previously used `PageHeader`
- Route-level loading skeletons that must keep the real page title
- Detail routes that need a breadcrumb back to the list

## When NOT to use

- Login and other pre-shell routes
- Nested widgets that are not a page
- The sidebar / app chrome (`AdminShell`)

## Examples

```tsx
<AdminPageShell
  title="Bookings"
  actions={<Button render={<Link href="/bookings/new" />} nativeButton={false}>Add</Button>}
  tabs={<AdminPageTabs tabs={ADMIN_BOOKING_TABS} value={tab} onValueChange={setTab} />}
>
  <AdminDataTable ... />
</AdminPageShell>
```

## Gotchas

- Server-safe. Do not add `"use client"` here; `AdminBreadcrumb` and `AdminPageTabs` are the client leaves.
- Keep `<h1 className="font-display text-3xl">` so title geometry matches the previous header.
- Roster (`/sessions/[sessionId]/roster`) lights Schedule in the sidebar, but `AdminBreadcrumb` still cannot infer a "Roster" segment — pass an explicit `Schedule › Roster` trail at the call site.
- Detail titles that are still loading should use the id, never `undefined`.
