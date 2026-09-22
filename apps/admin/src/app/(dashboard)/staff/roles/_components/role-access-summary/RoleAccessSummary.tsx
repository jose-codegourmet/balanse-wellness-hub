import {
  accessibleAdminPagesForPermissions,
  type PermissionKey,
  permissionLabel,
  sensitivePermissionsOf,
} from "@balanse/domain";

export type RoleAccessSummaryProps = {
  permissionKeys: readonly PermissionKey[];
};

export function RoleAccessSummary({ permissionKeys }: RoleAccessSummaryProps) {
  const pages = accessibleAdminPagesForPermissions(permissionKeys);
  const sensitive = sensitivePermissionsOf(permissionKeys);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl border border-border/70 bg-background/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Accessible pages</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
            {pages.length}
          </span>
        </div>
        {pages.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No admin pages would open yet.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {pages.map((page) => (
              <li
                key={page.href || page.label}
                className="rounded-md border border-border/70 bg-card px-2.5 py-1"
              >
                {page.label}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-xl border border-border/70 bg-background/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Sensitive data</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
            {sensitive.length}
          </span>
        </div>
        {sensitive.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No compensation, refund, or financial permissions selected.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {sensitive.map((key) => (
              <li
                key={key}
                className="rounded-md border border-destructive/25 bg-destructive/5 px-2.5 py-1"
              >
                {permissionLabel(key)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
