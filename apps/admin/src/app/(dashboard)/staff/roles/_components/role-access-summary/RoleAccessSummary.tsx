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
      <section className="rounded-md border border-border bg-muted/30 px-3 py-3">
        <h3 className="text-sm font-medium">Accessible pages</h3>
        {pages.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No admin pages would open yet.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {pages.map((page) => (
              <li key={page.href || page.label}>{page.label}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-md border border-border bg-muted/30 px-3 py-3">
        <h3 className="text-sm font-medium">Sensitive data</h3>
        {sensitive.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No compensation, refund, or financial permissions selected.
          </p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {sensitive.map((key) => (
              <li key={key}>{permissionLabel(key)}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
