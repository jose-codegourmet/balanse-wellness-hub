# AdminSidebar — Use Cases

> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

## Purpose

Composition root for admin shell chrome: desktop collapsible rail and mobile `Sheet` drawer.

## When to use

- `AdminShell` / `(dashboard)/layout.tsx` only
- Persist width via the `balanse-admin-sidebar` cookie

## When NOT to use

- Customer portal sidebar
- Changing the admin nav catalogue — that stays in `@balanse/domain`

## Examples

```tsx
<AdminSidebar defaultCollapsed={collapsed} pathname={pathname} onLogout={logOut} />
```

## Gotchas

- Pass `pathname` in (do not call `usePathname` here) so stories stay props-driven. Preview now provides the App Router mock from #211.
- Live counts come from `useQuery(adminDashboardQuery(principal.role))` so they share the dashboard cache with `DashboardPage`. Pass `snapshot` to skip the query (stories).
- Roster routes (`/sessions/[id]/roster`) light Schedule via `isAdminNavActive`. Breadcrumb still passes an explicit `Schedule › Roster` trail — do not invent that segment in the sidebar.
