# AdminDataTable — Use Cases

> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

## Purpose

The single TanStack table for every admin list. Toolbar, pagination, optional facets, column visibility, density, row actions, and URL-persisted state live here so screens stay data-source agnostic and pass `data` + `columns`. Below the tablet breakpoint (`useBreakpoint` / `useIsMobile`), the same table state renders as a vertical card list.

## When to use

- Every admin list: bookings, staff, customers, payments, dashboard schedule, and the three `/reports` tables
- Any new admin collection that is a row of records with sort, search, or paging

## When NOT to use

- Notification queues (`FE-ADM-020` / #210) stay `<ul>` card lists and get virtualization there — tables stay paginated
- `RosterPage` is a deliberate exception: it is a roster card / definition-list layout, not a data table. Do not force it into `AdminDataTable`
- `@balanse/ui` `DataTable` is a primitive showcase with no app consumers; do not build admin screens on it. The vendored Jabkit `data-table/` stays pristine and unused
- Do not use `@balanse/ui` `StatusBadge` for staff (`active` / `disabled`) or session (`PUBLISHED` / `DRAFT` / cancelled) chips — those are not booking statuses. Use `Badge` with an explicit variant map and `dot`

## Examples

```tsx
<AdminDataTable
  tableId="staff"
  data={rows}
  columns={columns}
  getRowId={(row) => row.id}
  searchPlaceholder="Search staff"
  enableColumnVisibility
  enablePageSize
/>
```

Facet a column without changing the cell:

```tsx
{
  id: "status",
  header: "Status",
  accessorFn: (row) => staffStatusLabel(row.status),
  enableColumnFilter: true,
  meta: { enableFaceting: true, facetLabel: "Status" },
}
```

Mark a primary link cell so the row is keyboard-reachable without `onRowClick`, and place the column on the mobile card:

```tsx
{
  accessorKey: "fullName",
  header: "Name",
  meta: { primaryLink: (row) => `/customers/${row.id}`, mobile: { role: "title" } },
}
```

`layout` is `"auto"` by default (cards below 768, table at tablet+). Pin `"table"` or `"cards"` in Storybook. Columns without `mobile` meta become labelled key/value rows so nothing disappears. Use `role: "hidden"` only when the column is already represented (e.g. a Review link that duplicates `primaryLink`).

## Gotchas

- `tableId` is required. It namespaces URL keys (`staff_page`, `staff_sort`, `staff_q`, `staff_facets`) and `localStorage` prefs (`balanse-admin-table:<tableId>:prefs`). The three `/reports` tables must stay `reports-classes`, `reports-coaches`, and `reports-sessions` or they collide
- URL writes use `router.replace(..., { scroll: false })` and preserve unrelated params such as bookings `?tab=`
- `persistUrl` defaults to `true` in the app (wrapped in `Suspense` so pages without a boundary still render). Stories set `persistUrl: false`
- Page-size options are `8 / 10 / 25 / 50`. `8` is `ADMIN_BOOKING_PAGE_SIZE` and remains the default so existing lists do not jump to 10
- Column visibility, density, faceted filters, sticky header, row actions, and the page-size selector are opt-in. A simple list stays a simple list
- There is no `FeedbackStateId` for an empty *filter* result. Use `emptyStateId` / `empty` for a truly empty dataset; filtered-empty falls back to `emptyFilterLabel` (`"No rows match your filter."`)
- Column pinning, resizable columns, and CSV/Excel export are follow-ups (`/reports` is the likely export home). Virtualized rows belong to #210. Server-side paging is `BE-050`; this table stays client-side against the mock
- Do not revive the dead `DataTable({ columns: string[] })` helper that used to live in `modules/admin/shared.tsx`
