"use client";

import {
  type CoachStudent,
  formatPeso,
  formatSessionDate,
  formatSessionTime,
} from "@balanse/domain";
import { Badge, FeedbackState, ToggleGroup, ToggleGroupItem, UserAvatar } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, CircleDollarSign, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { coachStudentsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { CoachStudentsPageProps } from "./CoachStudentsPage.meta";

type StudentScope = "upcoming" | "existing";

const STUDENT_SCOPES: { id: StudentScope; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "existing", label: "Existing" },
];

export function CoachStudentsPage({ empty = false }: CoachStudentsPageProps) {
  const { principal } = useMockPrincipal();
  const studentsQuery = useSuspenseQuery(coachStudentsQuery(principal));
  const [scope, setScope] = useState<StudentScope>("upcoming");
  const students = empty ? [] : studentsQuery.data;
  const rows = useMemo(
    () =>
      students.filter((student) =>
        scope === "upcoming" ? student.upcomingBookingCount > 0 : student.sessionsAttended > 0,
      ),
    [scope, students],
  );
  const upcomingCount = students.filter((student) => student.upcomingBookingCount > 0).length;
  const existingCount = students.filter((student) => student.sessionsAttended > 0).length;
  const totalContribution = students.reduce((total, student) => total + student.contributionPhp, 0);

  const columns = useMemo<ColumnDef<CoachStudent, unknown>[]>(
    () => [
      {
        id: "fullName",
        header: "Student",
        // Search matches nickname too: the global filter reads this accessor.
        accessorFn: (row) => [row.fullName, row.nickname].filter(Boolean).join(" "),
        sortingFn: (a, b) => a.original.fullName.localeCompare(b.original.fullName),
        // `primaryLink` wraps the cell in the student link (no nested anchor).
        meta: { primaryLink: (row) => `/students/${row.id}`, mobile: { role: "title" } },
        cell: ({ row }) => {
          const student = row.original;
          const nickname = student.nickname?.trim();
          return (
            <span className="flex min-w-0 items-center gap-3">
              <span aria-hidden className="shrink-0">
                <UserAvatar
                  name={{ firstName: student.firstName, lastName: student.lastName }}
                  avatarUrl={student.avatarUrl}
                  seed={student.id}
                  size="lg"
                />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2">{student.fullName}</span>
                {nickname ? (
                  <span className="inline-block text-xs font-normal text-muted-foreground italic">
                    {nickname}
                  </span>
                ) : null}
              </span>
            </span>
          );
        },
      },
      {
        id: "next-or-last",
        header: scope === "upcoming" ? "Next class" : "Last attended",
        accessorFn: (row) => row.nextBooking?.startsAt ?? row.lastAttendedAt ?? "",
        meta: { mobile: { role: "subtitle" } },
        cell: ({ row }) => {
          const session = scope === "upcoming" ? row.original.nextBooking : null;
          const date = session?.startsAt ?? row.original.lastAttendedAt;
          if (!date) return "—";
          return (
            <div>
              <p>{session?.className ?? formatSessionDate(date)}</p>
              <p className="text-xs text-muted-foreground">
                {formatSessionDate(date)} · {formatSessionTime(date)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "sessionsAttended",
        header: "Attended",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => <span className="tabular-nums">{row.original.sessionsAttended}</span>,
      },
      {
        accessorKey: "contributionPhp",
        header: "Contribution",
        meta: { mobile: { role: "status" } },
        cell: ({ row }) => formatPeso(row.original.contributionPhp),
      },
    ],
    [scope],
  );

  return (
    <AdminPageShell
      breadcrumb={[{ label: "My Students" }]}
      description="Students are limited to your own classes. Contribution reflects paid bookings and consumed package class value in those sessions."
      eyebrow="Teaching workspace"
      title="My Students"
      stats={
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <UsersRound aria-hidden className="size-4 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{upcomingCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">Students with an upcoming class</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <CalendarClock aria-hidden className="size-4 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{existingCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">Students you have taught</p>
          </div>
          <div className="col-span-2 rounded-xl border border-border/70 bg-card p-4 xl:col-span-1">
            <CircleDollarSign aria-hidden className="size-4 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {formatPeso(totalContribution)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Class contribution</p>
          </div>
        </div>
      }
    >
      {students.length === 0 ? (
        <FeedbackState
          id="customer.no-bookings"
          title="No students yet"
          description="Students appear here after they book or attend one of your classes."
        />
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ToggleGroup
              aria-label="Student cohort"
              size="sm"
              value={[scope]}
              variant="outline"
              onValueChange={(next) => {
                const picked = Array.isArray(next) ? next[0] : next;
                if (picked === "upcoming" || picked === "existing") setScope(picked);
              }}
            >
              {STUDENT_SCOPES.map((item) => {
                const count = item.id === "upcoming" ? upcomingCount : existingCount;
                return (
                  <ToggleGroupItem key={item.id} value={item.id}>
                    {item.label}
                    <Badge appearance="soft" className="ml-1.5" size="sm" variant="neutral">
                      {count}
                    </Badge>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            <p className="text-sm text-muted-foreground">
              {scope === "upcoming"
                ? "Students with a future booking in your classes."
                : "Students with recorded attendance in your classes."}
            </p>
          </div>
          <AdminDataTable
            columns={columns}
            data={rows}
            empty={
              <p className="py-6 text-sm text-muted-foreground">No students in this cohort yet.</p>
            }
            getRowId={(row) => row.id}
            searchPlaceholder="Search name or nickname"
            tableId="coach-students"
            title={scope === "upcoming" ? "Upcoming students" : "Existing students"}
          />
        </div>
      )}
    </AdminPageShell>
  );
}
