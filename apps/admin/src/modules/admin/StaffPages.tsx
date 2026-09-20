"use client";

import { ADMIN_ROLE_CAPABILITY_NOTE, type AdminStaff, staffStatusLabel } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Badge, Button, FeedbackState, FormPageSkeleton, NativeSelect, TablePageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { adminStaffQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { ConfirmAction, TextField } from "./shared";

export function StaffListPage({ empty }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const query = useQuery(adminStaffQuery(principal.role));
  const rows = empty ? [] : (query.data ?? null);

  const columns = useMemo<ColumnDef<AdminStaff, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/staff/${row.id}` },
      },
      {
        id: "role",
        header: "Role",
        accessorFn: () => "Admin",
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => staffStatusLabel(row.status),
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "Status" },
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
        cell: ({ row }) => (
          <Link className="underline underline-offset-4" href={`/staff/${row.original.id}`}>
            View/Edit
          </Link>
        ),
      },
    ],
    [],
  );

  if (!rows) {
    return (
      <AdminPageShell title="Staff Management">
        <TablePageSkeleton label="Loading staff" rows={6} columns={4} />
      </AdminPageShell>
    );
  }

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
  const query = useQuery(adminStaffQuery(principal.role));
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

  if (!row) {
    return (
      <AdminPageShell title={isNew ? "Add Staff" : "Staff Detail"}>
        <FormPageSkeleton label="Loading staff" sections={1} fields={2} />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      className="max-w-xl"
      title={isNew ? "Add Staff" : "Staff Detail"}
      breadcrumb={[
        { label: "Staff", href: "/staff" },
        { label: isNew ? "Add Staff" : (row.name || staffId) },
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
        <TextField
          id="staff-name"
          label="Name"
          value={row.name}
          onChange={(name) => setRow({ ...row, name })}
        />
        <TextField
          id="staff-email"
          label="Email"
          type="email"
          value={row.email}
          onChange={(email) => setRow({ ...row, email })}
        />
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
