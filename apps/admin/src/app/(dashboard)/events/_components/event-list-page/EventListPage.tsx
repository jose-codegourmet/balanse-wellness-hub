"use client";

import {
  EVENT_STATUSES,
  type EventStatus,
  eventStatusLabel,
  formatSessionRange,
} from "@balanse/domain";
import {
  Badge,
  Button,
  FeedbackState,
  Input,
  Label,
  NativeSelect,
  TablePageSkeleton,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminBookingsQuery, adminClassesQuery, adminEventsQuery } from "@/lib/query/queries";
import { AdminCan, useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import {
  displayedEventStatus,
  displayedEventStatusLabel,
  eventBookedCount,
  eventClassName,
  eventInDateRange,
  eventPriceLabel,
} from "../../_lib/event-display";
import type { EventListPageProps } from "./EventListPage.meta";

type EventRow = {
  id: string;
  title: string;
  sessionLabel: string;
  venue: string;
  price: string;
  capacityLabel: string;
  status: EventStatus;
  statusLabel: string;
  placeholder: boolean;
};

function statusVariant(status: EventStatus) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  if (status === "ARCHIVED") return "neutral" as const;
  return "warning" as const;
}

export function EventListPage(props: EventListPageProps) {
  return (
    <Suspense
      fallback={
        <AdminPageShell title="Events">
          <TablePageSkeleton label="Loading events" rows={5} columns={6} />
        </AdminPageShell>
      }
    >
      <EventListPageInner {...props} />
    </Suspense>
  );
}

function EventListPageInner({
  empty,
  loading,
  error,
  initialStatus = "all",
  initialSearch = "",
}: EventListPageProps) {
  const router = useRouter();
  const params = useSearchParams();
  const { principal } = useMockPrincipal();
  const canReadClasses = useCanAdminRoute("/classes");
  const canReadBookings = useCanAdminRoute("/bookings");
  const eventsQuery = useQuery(adminEventsQuery(principal));
  const classesQuery = useQuery({
    ...adminClassesQuery(principal),
    enabled: canReadClasses,
  });
  const bookingsQuery = useQuery({
    ...adminBookingsQuery(principal),
    enabled: canReadBookings,
  });

  const [status, setStatus] = useState<EventStatus | "all">(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sessionId, setSessionId] = useState(() => params.get("session") ?? "all");

  const source = useMemo(() => (empty ? [] : (eventsQuery.data ?? [])), [empty, eventsQuery.data]);
  const rangeInvalid = Boolean(from && to && from > to);
  const filtered = useMemo(() => {
    if (rangeInvalid) return [];
    const needle = search.trim().toLowerCase();
    return source.filter((event) => {
      if (status !== "all" && displayedEventStatus(event) !== status) return false;
      if (sessionId !== "all" && event.sessionId !== sessionId) return false;
      if (!eventInDateRange(event, from, to)) return false;
      if (needle && !event.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [from, rangeInvalid, search, sessionId, source, status, to]);

  const sessionOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const event of source) {
      if (seen.has(event.sessionId)) continue;
      seen.set(
        event.sessionId,
        `${eventClassName(event, classesQuery.data)} · ${formatSessionRange(event.session.startsAt, event.session.endsAt)}`,
      );
    }
    return [...seen.entries()];
  }, [classesQuery.data, source]);

  const rows = useMemo<EventRow[]>(
    () =>
      filtered.map((event) => ({
        id: event.id,
        title: event.title,
        sessionLabel: `${eventClassName(event, classesQuery.data)} · ${formatSessionRange(event.session.startsAt, event.session.endsAt)}`,
        venue: event.venueName || "—",
        price: eventPriceLabel(event),
        capacityLabel: `${eventBookedCount(event, bookingsQuery.data)} / ${event.session.capacity}`,
        status: displayedEventStatus(event),
        statusLabel: displayedEventStatusLabel(event),
        placeholder: event.isPlaceholder,
      })),
    [bookingsQuery.data, classesQuery.data, filtered],
  );

  const columns = useMemo<ColumnDef<EventRow, unknown>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Event",
        meta: { mobile: { role: "title" } },
      },
      {
        accessorKey: "sessionLabel",
        header: "Session",
        meta: { mobile: { role: "subtitle" } },
      },
      {
        accessorKey: "venue",
        header: "Venue",
        meta: { mobile: { role: "meta" } },
      },
      {
        accessorKey: "price",
        header: "Price",
        meta: { mobile: { role: "meta" } },
      },
      {
        accessorKey: "capacityLabel",
        header: "Booked / capacity",
        meta: { mobile: { role: "meta" } },
      },
      {
        id: "status",
        header: "State",
        accessorFn: (row) => row.statusLabel,
        meta: { mobile: { role: "status" } },
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)} appearance="solid" size="sm" dot>
            {row.original.statusLabel}
          </Badge>
        ),
      },
    ],
    [],
  );

  const scopedHasEvent =
    sessionId !== "all" && source.some((event) => event.sessionId === sessionId);
  const createHref =
    sessionId !== "all" && !scopedHasEvent ? `/schedule/${sessionId}/event` : "/schedule";
  const filtersActive =
    status !== "all" || sessionId !== "all" || search.trim() !== "" || from !== "" || to !== "";

  function clearFilters() {
    setStatus("all");
    setSearch("");
    setFrom("");
    setTo("");
    setSessionId("all");
  }

  const showLoading = loading || eventsQuery.isPending;
  const showError = error || eventsQuery.isError;

  return (
    <AdminPageShell
      eyebrow="Operations"
      title="Events"
      description="One-off events tied to a scheduled session. Upcoming sessions are listed first."
      actions={
        <AdminCan action="events-manage">
          <Button nativeButton={false} render={<Link href={createHref} />}>
            Create event
          </Button>
        </AdminCan>
      }
      stats={
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EVENT_STATUSES.map((item) => (
            <div
              key={item}
              className="border-border sm:border-l sm:pl-5 sm:first:border-l-0 sm:first:pl-0"
            >
              <dt className="text-xs font-medium text-muted-foreground">
                {eventStatusLabel(item)}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {source.filter((event) => event.status === item).length}
              </dd>
            </div>
          ))}
        </dl>
      }
    >
      {showLoading ? (
        <TablePageSkeleton label="Loading events" rows={5} columns={6} />
      ) : showError ? (
        <FeedbackState
          id="calendar.load-failed"
          className="mt-2"
          title="Could not load events"
          description="The event index did not load. Retry the request."
          onAction={() => {
            void eventsQuery.refetch();
          }}
        />
      ) : source.length === 0 ? (
        <FeedbackState id="admin.no-events" className="mt-2" />
      ) : (
        <div className="grid gap-4">
          <EventFilters
            status={status}
            search={search}
            from={from}
            to={to}
            sessionId={sessionId}
            sessionOptions={sessionOptions}
            rangeInvalid={rangeInvalid}
            onStatus={setStatus}
            onSearch={setSearch}
            onFrom={setFrom}
            onTo={setTo}
            onSession={setSessionId}
          />
          {filtered.length === 0 ? (
            <FeedbackState
              id="calendar.filter-empty"
              title="No events match these filters"
              description={
                rangeInvalid
                  ? "The start of the date range has to be on or before the end."
                  : "Try another state, date range, session, or title. The catalogue still has events."
              }
              actionLabel="Clear filters"
              onAction={filtersActive ? clearFilters : undefined}
            />
          ) : (
            <AdminDataTable
              tableId="events"
              data={rows}
              columns={columns}
              getRowId={(row) => row.id}
              persistUrl={false}
              searchable={false}
              pageSize={25}
              onRowClick={(row) => {
                router.push(`/events/${row.id}`);
              }}
              rowActions={(row) => [{ id: "view", label: "View", href: `/events/${row.id}` }]}
              footnote={
                rows.some((row) => row.placeholder)
                  ? "Session prices on placeholder events are non-authoritative (OQ-PRICE)."
                  : undefined
              }
            />
          )}
        </div>
      )}
    </AdminPageShell>
  );
}

function EventFilters({
  status,
  search,
  from,
  to,
  sessionId,
  sessionOptions,
  rangeInvalid,
  onStatus,
  onSearch,
  onFrom,
  onTo,
  onSession,
}: {
  status: EventStatus | "all";
  search: string;
  from: string;
  to: string;
  sessionId: string;
  sessionOptions: [string, string][];
  rangeInvalid: boolean;
  onStatus: (value: EventStatus | "all") => void;
  onSearch: (value: string) => void;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  onSession: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
      <div className="grid gap-1.5">
        <Label htmlFor="event-search">Title</Label>
        <Input
          id="event-search"
          value={search}
          placeholder="Search by title"
          onChange={(event) => {
            onSearch(event.target.value);
          }}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="event-status">State</Label>
        <NativeSelect
          id="event-status"
          value={status}
          onChange={(event) => {
            onStatus(event.target.value as EventStatus | "all");
          }}
        >
          <option value="all">All states</option>
          {EVENT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {eventStatusLabel(item)}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="event-session">Session</Label>
        <NativeSelect
          id="event-session"
          value={sessionId}
          onChange={(event) => {
            onSession(event.target.value);
          }}
        >
          <option value="all">All sessions</option>
          {sessionOptions.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="event-from">From</Label>
        <Input
          id="event-from"
          type="date"
          value={from}
          aria-invalid={rangeInvalid}
          onChange={(event) => {
            onFrom(event.target.value);
          }}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="event-to">To</Label>
        <Input
          id="event-to"
          type="date"
          value={to}
          aria-invalid={rangeInvalid}
          onChange={(event) => {
            onTo(event.target.value);
          }}
        />
      </div>
    </div>
  );
}
