# DataTable — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

`@tanstack/react-table` wrapper that renders **Table** primitives with sorting, filtering, and pagination.

## When to use

- Column-driven datasets needing sort, filter, prev/next pagination

## When NOT to use

- One-off static content → compose **Table** primitives instead

## Examples

### Basic data table

```tsx
const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

<DataTable columns={columns} data={data} />
```

### With column filter

```tsx
<DataTable
  columns={columns}
  data={data}
  filterColumn="name"
  filterPlaceholder="Search by name..."
/>
```

## Gotchas

- `"use client"`; filter only works if `filterColumn` matches a column id; selection styling exists but no built-in row-selection UI.
