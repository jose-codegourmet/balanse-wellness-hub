# Admin Portal — Role Management

```text
ROLES                               [Create role]
Name | Type              | State  | Assigned | Permissions | Action
Super Admin | Built-in · protected | Active | 1 | 40 | View · Clone
Front Desk  | Built-in · protected | Active | 2 | 17 | View · Clone
Coach       | Built-in · protected | Active | 1 | 4  | View · Clone
Community Host | Custom           | Active | 1 | 4  | Edit · Clone

ROLE FORM
Name
Description
Clone source (when ?from= is present)
Grouped permission checklist from PERMISSION_REGISTRY
  [Select group] [Clear group]
Sensitive-permission warnings
Live accessible pages + sensitive data
[Save role] [Cancel] [Archive] (custom, unassigned only)
```

Routes: `/staff/roles`, `/staff/roles/new`, `/staff/roles/[roleId]`.

Ownership is ticket #297. Navigation gating stays with #295. Data is mock-only
through `getMockAdapter()` / React Query. No UI `/api/*` or Supabase.

Built-in Super Admin, Front Desk, and Coach are view-only. Custom roles can
create, edit, clone, and archive when nobody is assigned. A role with zero
permissions cannot save.
