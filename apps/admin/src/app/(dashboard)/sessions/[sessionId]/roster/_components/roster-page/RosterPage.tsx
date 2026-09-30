"use client";

import {
  attendanceUtilisation,
  type BookingStatus,
  type CustomerBooking,
  formatRatioPercent,
  formatSessionDate,
  formatSessionTime,
  NO_REFUND_ON_NOSHOW_NOTE,
  occupancyRatio,
  paymentStatusLabel,
  sessionDisplayName,
} from "@balanse/domain";
import { isMockAuthorizationError } from "@balanse/mock";
import {
  Button,
  DetailPageSkeleton,
  FeedbackState,
  Input,
  StatusBadge,
  ToggleGroup,
  ToggleGroupItem,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useCheckIn, useMarkNoShow } from "@/lib/query/mutations";
import { adminSessionRosterQuery } from "@/lib/query/queries";
import { AdminCan, useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const BREADCRUMB = [{ label: "Schedule", href: "/schedule" }, { label: "Roster" }];

type AttendanceFilter = "all" | "to_check_in" | "checked_in" | "no_show";

const ATTENDANCE_FILTERS: { id: AttendanceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "to_check_in", label: "To check in" },
  { id: "checked_in", label: "Checked in" },
  { id: "no_show", label: "No-show" },
];

function matchesAttendance(status: BookingStatus, filter: AttendanceFilter): boolean {
  if (filter === "to_check_in") return status === "CONFIRMED";
  if (filter === "checked_in") return status === "CHECKED_IN";
  if (filter === "no_show") return status === "NO_SHOW";
  return true;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function RosterPage({ sessionId }: { sessionId: string }) {
  const { principal } = useMockPrincipal();
  const canReadPayments = useCanAdminRoute("/payments");
  const rosterQuery = useQuery(adminSessionRosterQuery(principal, sessionId));
  const checkIn = useCheckIn();
  const markNoShow = useMarkNoShow();
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState<AttendanceFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  if (rosterQuery.isPending && !rosterQuery.data) {
    return (
      <AdminPageShell title="Roster" breadcrumb={BREADCRUMB}>
        <DetailPageSkeleton label="Loading roster" />
      </AdminPageShell>
    );
  }

  if (rosterQuery.isError || !rosterQuery.data) {
    const error = rosterQuery.error;
    if (
      isMockAuthorizationError(error) &&
      (error.code === "ownership" || error.code === "forbidden")
    ) {
      return <AccessDenied kind="ownership" homeHref="/schedule" />;
    }
    return (
      <AdminPageShell title="Roster" breadcrumb={BREADCRUMB}>
        <FeedbackState
          id="calendar.load-failed"
          title="Roster could not load"
          description="This session roster did not load. Retry the request or return to the schedule."
          actionLabel="Retry"
          onAction={() => {
            void rosterQuery.refetch();
          }}
        />
      </AdminPageShell>
    );
  }

  const roster = rosterQuery.data;
  const query = search.trim().toLowerCase();
  const byName = (row: CustomerBooking) =>
    !query || (row.customerName ?? "").toLowerCase().includes(query);
  const attendanceCounts: Record<AttendanceFilter, number> = {
    all: roster.confirmed.length,
    to_check_in: roster.confirmed.filter((row) => matchesAttendance(row.status, "to_check_in"))
      .length,
    checked_in: roster.confirmed.filter((row) => matchesAttendance(row.status, "checked_in"))
      .length,
    no_show: roster.confirmed.filter((row) => matchesAttendance(row.status, "no_show")).length,
  };
  const confirmedRows = roster.confirmed.filter(
    (row) => byName(row) && matchesAttendance(row.status, attendance),
  );
  const heldRows = roster.held.filter(byName);
  const waitlistRows = roster.waitlisted.filter(byName);
  const filtering = query !== "" || attendance !== "all";

  async function runAttendance(
    bookingId: string,
    action: (id: string) => Promise<unknown>,
    onDone: () => void,
  ) {
    setBusyId(bookingId);
    try {
      await action(bookingId);
      onDone();
    } catch {
      notify.admin("booking.check-in-failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminPageShell
      className="max-w-6xl overflow-x-hidden"
      eyebrow="Live session roster"
      title={sessionDisplayName(roster.session)}
      description={`${formatSessionDate(roster.session.startsAt)} · ${formatSessionTime(roster.session.startsAt)} · ${roster.session.coachName}`}
      breadcrumb={BREADCRUMB}
      stats={<RosterStats roster={roster} />}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search guests"
            aria-label="Search guests by name"
            className="pl-9"
          />
        </div>
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[attendance]}
          onValueChange={(next) => {
            const picked = Array.isArray(next) ? next[0] : next;
            if (ATTENDANCE_FILTERS.some((filter) => filter.id === picked))
              setAttendance(picked as AttendanceFilter);
          }}
          aria-label="Filter by attendance"
          className="max-w-full overflow-x-auto"
        >
          {ATTENDANCE_FILTERS.map((filter) => (
            <ToggleGroupItem key={filter.id} value={filter.id}>
              {filter.label}
              <span className="ml-1.5 tabular-nums opacity-70">{attendanceCounts[filter.id]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.75fr)]">
        <div className="grid gap-6">
          <RosterSection
            title="Attendance"
            description="Confirmed guests. Check people in as they arrive."
            count={confirmedRows.length}
            total={roster.confirmed.length}
            empty={
              filtering
                ? "No confirmed guests match this search or filter."
                : "No confirmed guests yet."
            }
          >
            {confirmedRows.map((row) => (
              <GuestRow key={row.id} row={row} showPayment={canReadPayments}>
                {row.status === "CONFIRMED" ? (
                  <AdminCan action="attendance">
                    <Button
                      type="button"
                      loading={busyId === row.id && checkIn.isPending}
                      disabled={busyId !== null}
                      onClick={() =>
                        runAttendance(row.id, checkIn.mutateAsync, () =>
                          notify.admin("booking.checked-in"),
                        )
                      }
                    >
                      Check in
                    </Button>
                    <ConfirmAction
                      triggerLabel="No-show"
                      title={`Mark ${row.customerName ?? "this guest"} as no-show?`}
                      description={NO_REFUND_ON_NOSHOW_NOTE}
                      confirmLabel="Mark no-show"
                      variant="outline"
                      disabled={busyId !== null}
                      onConfirm={() =>
                        runAttendance(row.id, markNoShow.mutateAsync, () =>
                          notify.success({
                            title: "Marked no-show",
                            description: "Attendance is recorded for this booking.",
                          }),
                        )
                      }
                    />
                  </AdminCan>
                ) : null}
              </GuestRow>
            ))}
          </RosterSection>

          <RosterSection
            title="Held / pending"
            description="Holding a place but not confirmed. Resolve payment before class."
            count={heldRows.length}
            total={roster.held.length}
            empty={query ? "No held guests match this search." : "Nobody is holding a place."}
          >
            {heldRows.map((row) => (
              <GuestRow key={row.id} row={row} showPayment={canReadPayments} />
            ))}
          </RosterSection>
        </div>

        <RosterSection
          title="Waitlist"
          description="First in, first offered."
          count={waitlistRows.length}
          total={roster.waitlisted.length}
          empty={query ? "No waitlisted guests match this search." : "The waitlist is empty."}
          ordered
        >
          {waitlistRows.map((row) => (
            <GuestRow
              key={row.id}
              row={row}
              showPayment={false}
              position={roster.waitlisted.indexOf(row) + 1}
              hideStatus
            />
          ))}
        </RosterSection>
      </div>
    </AdminPageShell>
  );
}

type RosterCounts = {
  capacity: number;
  confirmedCount: number;
  heldCount: number;
  available: number;
  waitlistedCount: number;
  checkedIn: number;
  noShow: number;
};

function RosterStats({ roster }: { roster: RosterCounts }) {
  const occupancy = occupancyRatio(roster.confirmedCount, roster.capacity);
  const attendance = attendanceUtilisation(roster.checkedIn, roster.capacity);
  const awaiting = Math.max(0, roster.confirmedCount - roster.checkedIn);
  const scale = Math.max(roster.capacity, roster.confirmedCount + roster.heldCount, 1);
  const segments = [
    { key: "checked-in", value: roster.checkedIn, className: "bg-primary", label: "Checked in" },
    {
      key: "awaiting",
      value: awaiting,
      className: "bg-primary/45",
      label: "Confirmed, not checked in",
    },
    {
      key: "held",
      value: roster.heldCount,
      className: "bg-[var(--balanse-gold)]",
      label: "Held",
    },
  ];

  return (
    <div className="grid gap-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-primary p-3 text-primary-foreground">
          <dt className="text-xs text-primary-foreground/70">Checked in</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {roster.checkedIn}
            <span className="text-base font-normal text-primary-foreground/70">
              {" "}
              / {roster.confirmedCount}
            </span>
          </dd>
        </div>
        <Stat label="Places available" value={roster.available} />
        <Stat label="Held" value={roster.heldCount} />
        <Stat label="Waitlisted" value={roster.waitlistedCount} />
      </dl>
      <div className="grid gap-2">
        <div
          className="flex h-2.5 overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`${roster.checkedIn} checked in, ${awaiting} confirmed not checked in, ${roster.heldCount} held, ${roster.available} available, of ${roster.capacity} places`}
        >
          {segments.map((segment) =>
            segment.value > 0 ? (
              <span
                key={segment.key}
                className={segment.className}
                style={{ width: `${(segment.value / scale) * 100}%` }}
              />
            ) : null,
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            {segments.map((segment) => (
              <span key={segment.key} className="inline-flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${segment.className}`} aria-hidden />
                {segment.label}
              </span>
            ))}
          </span>
          <span className="tabular-nums">
            Capacity {roster.capacity} · Occupancy {formatRatioPercent(occupancy)} · Attendance{" "}
            {formatRatioPercent(attendance)} · No-show {roster.noShow}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function RosterSection({
  title,
  description,
  count,
  total,
  empty,
  ordered = false,
  children,
}: {
  title: string;
  description: string;
  count: number;
  total: number;
  empty: string;
  ordered?: boolean;
  children: React.ReactNode;
}) {
  const List = ordered ? "ol" : "ul";
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-border/70 bg-muted/25 p-4 sm:p-5">
        <div>
          <h2 className="font-display text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 rounded-sm bg-muted px-2.5 py-1 text-xs font-medium tabular-nums">
          {count === total ? total : `${count} of ${total}`}
        </span>
      </header>
      {count === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <List className="divide-y divide-border/70">{children}</List>
      )}
    </section>
  );
}

function GuestRow({
  row,
  showPayment,
  position,
  hideStatus = false,
  children,
}: {
  row: CustomerBooking;
  showPayment: boolean;
  position?: number;
  hideStatus?: boolean;
  children?: React.ReactNode;
}) {
  const name = row.customerName ?? "Guest";
  return (
    <li className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-muted/20 sm:px-5">
      <span
        className={
          position
            ? "grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground tabular-nums"
            : "grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold"
        }
        aria-hidden={position ? undefined : true}
      >
        {position ?? initials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {hideStatus ? null : <StatusBadge status={row.status} surface="admin" />}
          {showPayment && row.paymentStatus !== "NONE" ? (
            <span>Payment: {paymentStatusLabel(row.paymentStatus)}</span>
          ) : null}
          <AdminCan href="/bookings">
            <Link className="underline underline-offset-4" href={`/bookings/${row.id}`}>
              View booking
            </Link>
          </AdminCan>
        </div>
      </div>
      {children ? <div className="flex flex-wrap gap-2 max-sm:w-full">{children}</div> : null}
    </li>
  );
}
