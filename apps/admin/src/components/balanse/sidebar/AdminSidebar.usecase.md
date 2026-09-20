# AdminSidebar — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

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

- Pass `pathname` in (do not call `usePathname` here) so Storybook can render without Next router mocks.
- `#204` (`FE-ADM-015`) is unlanded — the dashboard snapshot is still a local adapter call with `TODO(FE-ADM-015)`.
- Roster routes (`/sessions/[id]/roster`) match no nav href; missing active state is a known gap for #208.
