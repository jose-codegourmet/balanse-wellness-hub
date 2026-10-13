"use client";

import { createStaffInvite, createStaffPasswordReset } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import {
  ADMIN_ROLE_CAPABILITY_NOTE,
  type AdminStaff,
  splitFullName,
  staffCapabilityLabel,
  staffCoachFacetLabel,
  staffStatusLabel,
} from "@balanse/domain";
import { Badge, Button, FeedbackState, UserAvatar } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useHasAnyPermission } from "@/lib/auth/use-staff-permissions";
import { adminStaffQuery } from "@/lib/query/queries";
import { AdminCan, useCanAdminAction, useStaffActor } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { StaffInviteDialog } from "../staff-invite-dialog/StaffInviteDialog";

export type StaffListPageProps = { empty?: boolean };

export function StaffListPage({ empty }: StaffListPageProps) {
  const actor = useStaffActor();
  const inviting = useRef(false);
  const [linkPending, setLinkPending] = useState(false);
  const [invitation, setInvitation] = useState<{
    staffName: string;
    inviteUrl: string;
    kind: "invite" | "reset";
  } | null>(null);
  const canManageStaff = useCanAdminAction("staff-manage");
  const canOpenRoles = useHasAnyPermission(["roles.read", "roles.manage"]);
  const query = useSuspenseQuery(adminStaffQuery(actor, apiFetchBrowser));
  const rows = empty ? [] : query.data;

  const copyStaffLink = useCallback(async (row: AdminStaff, kind: "invite" | "reset") => {
    if (inviting.current) return;
    inviting.current = true;
    setLinkPending(true);
    const label = kind === "reset" ? "Password reset" : "Invite";
    const toastId = notify.loading({ title: `Creating ${label.toLowerCase()} link…` });
    try {
      const inviteUrl =
        kind === "reset"
          ? (await createStaffPasswordReset(apiFetchBrowser, row.id)).resetUrl
          : (await createStaffInvite(apiFetchBrowser, row.id)).inviteUrl;
      try {
        await navigator.clipboard.writeText(inviteUrl);
        notify.success({
          title: `${label} link copied`,
          description: `Share it privately with ${row.name}. No email was sent.`,
        });
      } catch {
        setInvitation({ staffName: row.name, inviteUrl, kind });
      }
    } catch (error) {
      notify.error({
        title: `Could not create ${label.toLowerCase()} link`,
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      inviting.current = false;
      setLinkPending(false);
      notify.dismiss(toastId);
    }
  }, []);

  const columns = useMemo<ColumnDef<AdminStaff, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/staff/${row.id}`, mobile: { role: "title" } },
        cell: ({ row }) => {
          return (
            <span className="flex min-w-0 items-center gap-2">
              <UserAvatar
                name={splitFullName(row.original.name)}
                avatarUrl={row.original.avatarUrl}
                seed={row.original.id}
              />
              <span className="truncate">{row.original.name}</span>
            </span>
          );
        },
      },
      {
        id: "role",
        header: "Role",
        accessorFn: (row) => staffCapabilityLabel(row),
        meta: { mobile: { role: "subtitle" } },
      },
      {
        id: "coach",
        header: "Coach",
        accessorFn: (row) => staffCoachFacetLabel(row.isCoach),
        enableColumnFilter: true,
        enableGlobalFilter: false,
        meta: { enableFaceting: true, facetLabel: "Coach", mobile: { role: "status" } },
        cell: ({ row }) =>
          row.original.isCoach ? (
            <Badge variant="info" appearance="soft" size="sm">
              {staffCoachFacetLabel(true)}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => staffStatusLabel(row.status),
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "Status", mobile: { role: "status" } },
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "disabled" ? "danger" : "success"}
            appearance="solid"
            size="sm"
            dot
          >
            {staffStatusLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "action",
        header: "Action",
        enableSorting: false,
        meta: { mobile: { role: "hidden" } },
        cell: ({ row }) => (
          <Link className="underline underline-offset-4" href={`/staff/${row.original.id}`}>
            {canManageStaff ? "View/Edit" : "View"}
          </Link>
        ),
      },
      ...(canManageStaff
        ? [
            {
              id: "invite",
              header: "Invite",
              enableSorting: false,
              enableHiding: false,
              meta: { mobile: { role: "meta" } },
              cell: ({ row }) =>
                row.original.status === "active" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={linkPending}
                    title="Copy invite link to clipboard"
                    aria-label={`Copy invite link to clipboard for ${row.original.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyStaffLink(row.original, "invite");
                    }}
                  >
                    <Copy aria-hidden />
                    Copy link
                  </Button>
                ) : (
                  <span className="text-muted-foreground">—</span>
                ),
            } satisfies ColumnDef<AdminStaff, unknown>,
            {
              id: "reset-password",
              header: "Reset password",
              enableSorting: false,
              enableHiding: false,
              meta: { mobile: { role: "meta" } },
              cell: ({ row }) =>
                row.original.status === "active" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={linkPending}
                    title="Copy password reset link. No email is sent."
                    aria-label={`Copy password reset link to clipboard for ${row.original.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyStaffLink(row.original, "reset");
                    }}
                  >
                    <RotateCcw aria-hidden />
                    Copy link
                  </Button>
                ) : (
                  <span className="text-muted-foreground">—</span>
                ),
            } satisfies ColumnDef<AdminStaff, unknown>,
          ]
        : []),
    ],
    [canManageStaff, copyStaffLink, linkPending],
  );

  return (
    <AdminPageShell
      title="Staff Management"
      actions={
        <div className="flex flex-wrap gap-2">
          {canOpenRoles ? (
            <Button nativeButton={false} variant="outline" render={<Link href="/staff/roles" />}>
              Manage roles
            </Button>
          ) : null}
          <AdminCan action="staff-manage">
            <Button nativeButton={false} render={<Link href="/staff/new" />}>
              Add Staff
            </Button>
          </AdminCan>
        </div>
      }
    >
      <p className="max-w-2xl text-sm text-muted-foreground">{ADMIN_ROLE_CAPABILITY_NOTE}</p>
      {rows.length === 0 ? (
        <FeedbackState id="admin.no-staff" className="mt-6" />
      ) : (
        <div className="mt-4">
          <AdminDataTable
            tableId="staff"
            data={rows}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search staff"
          />
        </div>
      )}
      {invitation ? (
        <StaffInviteDialog {...invitation} onClose={() => setInvitation(null)} />
      ) : null}
    </AdminPageShell>
  );
}
