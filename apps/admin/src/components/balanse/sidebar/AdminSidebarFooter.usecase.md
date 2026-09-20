# AdminSidebarFooter — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Theme toggle and account menu for the admin sidebar, including a logout confirm dialog.

## When to use

- Desktop rail and mobile drawer footers
- Collapsed rail — icon-only theme and avatar, same actions

## When NOT to use

- Inventing a display name on `MockPrincipal` — identity is `MOCK_ADMIN_CREDENTIALS[0].email`
- Customer portal logout — use `BalansePortalLogout`

## Examples

```tsx
<AdminSidebarFooter collapsed={collapsed} onSettings={goSettings} onLogout={logOut} />
```

## Gotchas

- Never render the mock password.
- Logout still runs `setPrincipal({ role: "guest" })` → `/login` → `refresh()` in `AdminShell`.
- Requires `MockSessionProvider` and `next-themes`.
