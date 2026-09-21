"use client";

import { ADMIN_ROLE_CAPABILITY_NOTE, type AdminStaff, staffStatusLabel } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Badge, Button, FeedbackState, Field, FieldLabel, Input, NativeSelect } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminStaffQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function StaffListPage({ empty }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminStaffQuery(principal.role));
  const rows = empty ? [] : query.data;

  const columns = useMemo<ColumnDef<AdminStaff, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/staff/${row.id}`, mobile: { role: "title" } },
      },
      {
        id: "role",
        header: "Role",
        accessorFn: () => "Admin",
        meta: { mobile: { role: "subtitle" } },
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
            View/Edit
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <AdminPageShell
      title="Staff Management"
      actions={
        <Button nativeButton={false} render={<Link href="/staff/new" />}>
          Add Staff
        </Button>
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
    </AdminPageShell>
  );
}

export function StaffDetailPage({ staffId }: { staffId: string }) {
  const router = useRouter();
  const isNew = staffId === "new";
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminStaffQuery(principal.role));
  const loaded = isNew
    ? { id: "", name: "", email: "", role: "ADMIN" as const, status: "active" as const }
    : (query.data?.find((s) => s.id === staffId) ?? null);
  const [row, setRow] = useState<AdminStaff | null>(isNew ? loaded : null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew || !query.data) return;
    const next = query.data.find((s) => s.id === staffId) ?? null;
    setRow(next);
  }, [isNew, query.data, staffId]);

  if (!row) return null;

  return (
    <AdminPageShell
      className="max-w-xl"
      title={isNew ? "Add Staff" : "Staff Detail"}
      breadcrumb={[
        { label: "Staff", href: "/staff" },
        { label: isNew ? "Add Staff" : row.name || staffId },
      ]}
    >
      <p className="text-sm text-muted-foreground">
        Invite or provision a staff account. There is no public admin registration.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{ADMIN_ROLE_CAPABILITY_NOTE}</p>
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void getMockAdapter()
            .upsertAdminStaff({
              id: isNew ? undefined : row.id,
              name: row.name,
              email: row.email,
              role: "ADMIN",
              status: row.status,
            })
            .then(() => {
              setSaved(true);
              router.push("/staff");
            });
        }}
      >
        <Field>
          <FieldLabel htmlFor="staff-name">Name</FieldLabel>
          <Input
            id="staff-name"
            value={row.name}
            onChange={(event) => setRow({ ...row, name: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="staff-email">Email</FieldLabel>
          <Input
            id="staff-email"
            type="email"
            value={row.email}
            onChange={(event) => setRow({ ...row, email: event.target.value })}
          />
        </Field>
        <div className="grid gap-1.5">
          <p className="text-sm font-medium">Role</p>
          <NativeSelect value="ADMIN" onChange={() => undefined} aria-label="Role">
            <option value="ADMIN">Admin</option>
          </NativeSelect>
        </div>
        <p className="text-sm">Status: {staffStatusLabel(row.status)}</p>
        {row.status === "disabled" ? (
          <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
            Access is disabled.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save</Button>
          {!isNew ? (
            <ConfirmAction
              triggerLabel="Disable Access"
              title="Disable staff access?"
              description="This staff account will no longer reach the admin portal."
              variant="outline"
              onConfirm={() =>
                getMockAdapter()
                  .disableAdminStaff(row.id)
                  .then((next) => setRow(next))
              }
            />
          ) : null}
        </div>
        {saved ? <p className="text-sm">Saved in this mock.</p> : null}
      </form>
    </AdminPageShell>
  );
}
