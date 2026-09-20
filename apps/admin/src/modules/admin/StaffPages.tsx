"use client";

import { ADMIN_ROLE_CAPABILITY_NOTE, type AdminStaff, staffStatusLabel } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, FeedbackState, LocalizedSkeleton, NativeSelect } from "@balanse/ui";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminDataTable, AdminStatusBadge } from "@/components/balanse/AdminDataTable";
import { ConfirmAction, PageHeader, TextField } from "./shared";

export function StaffListPage({ empty }: { empty?: boolean }) {
  const [rows, setRows] = useState<AdminStaff[] | null>(null);

  useEffect(() => {
    void getMockAdapter()
      .getAdminStaff()
      .then((staff) => setRows(empty ? [] : staff));
  }, [empty]);

  const columns = useMemo<ColumnDef<AdminStaff, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        id: "role",
        header: "Role",
        accessorFn: () => "Admin",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <AdminStatusBadge
            label={staffStatusLabel(row.original.status)}
            tone={row.original.status === "disabled" ? "destructive" : "primary"}
          />
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

  if (!rows) return <LocalizedSkeleton lines={5} label="Loading staff" />;

  return (
    <section>
      <PageHeader title="Staff Management">
        <Link
          href="/staff/new"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
        >
          Add Staff
        </Link>
      </PageHeader>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{ADMIN_ROLE_CAPABILITY_NOTE}</p>
      {rows.length === 0 ? (
        <FeedbackState id="admin.no-staff" className="mt-6" />
      ) : (
        <div className="mt-4">
          <AdminDataTable
            data={rows}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search staff"
          />
        </div>
      )}
    </section>
  );
}

export function StaffDetailPage({ staffId }: { staffId: string }) {
  const router = useRouter();
  const isNew = staffId === "new";
  const [row, setRow] = useState<AdminStaff | null>(
    isNew ? { id: "", name: "", email: "", role: "ADMIN", status: "active" } : null,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    void getMockAdapter()
      .getAdminStaff()
      .then((staff) => setRow(staff.find((s) => s.id === staffId) ?? null));
  }, [isNew, staffId]);

  if (!row) return <LocalizedSkeleton lines={6} label="Loading staff" />;

  return (
    <section className="max-w-xl">
      <PageHeader title={isNew ? "Add Staff" : "Staff Detail"} />
      <p className="mt-3 text-sm text-muted-foreground">
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
    </section>
  );
}
