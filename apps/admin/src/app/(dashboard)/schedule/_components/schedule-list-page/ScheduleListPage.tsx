"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  addCalendarDays,
  computeSessionInventory,
  manilaYmd,
  sessionDisplayName,
} from "@balanse/domain";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  useMinWidth,
} from "@balanse/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { CopyIcon, EllipsisIcon, PlusIcon, RepeatIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import {
  AdminScheduleCalendar,
  type AdminScheduleCalendarView,
} from "@/components/balanse/schedule-calendar/AdminScheduleCalendar";
import { adminTodayYmd } from "@/lib/clock";
import {
  adminBookingsQuery,
  adminSessionRosterQuery,
  adminSessionsQuery,
  adminVenuesQuery,
} from "@/lib/query/queries";
import { cn } from "@/lib/utils";
import {
  AdminCan,
  useCanAdminAction,
  useCanAdminRoute,
} from "@/modules/authorization/useAdminAccess";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { createSessionHref } from "../../_lib/schedule-href";
import { SelectedSessionPanel } from "../selected-session-panel/SelectedSessionPanel";
import type { SessionInventory } from "../selected-session-panel/SelectedSessionPanel.meta";

const SCHEDULE_VIEWS = ["auto", "month", "week", "day"] as const;

export function ScheduleListPage({
  empty,
  selectedDay: selectedDayProp,
  view: viewProp,
}: {
  empty?: boolean;
  /** Story-only. Opens this day in the sidebar on first render. */
  selectedDay?: string;
  view?: AdminScheduleCalendarView;
}) {
  return (
    <Suspense
      fallback={
        <ScheduleListPageInner
          empty={empty}
          selectedDay={selectedDayProp}
          view={viewProp ?? "auto"}
        />
      }
    >
      <ScheduleViewBridge empty={empty} selectedDay={selectedDayProp} view={viewProp} />
    </Suspense>
  );
}

function ScheduleViewBridge({
  empty,
  selectedDay,
  view: viewProp,
}: {
  empty?: boolean;
  selectedDay?: string;
  view?: AdminScheduleCalendarView;
}) {
  const [urlView, setUrlView] = useTabParam("view", SCHEDULE_VIEWS, "auto");
  return (
    <ScheduleListPageInner
      empty={empty}
      selectedDay={selectedDay}
      view={viewProp ?? urlView}
      onViewChange={viewProp ? undefined : setUrlView}
    />
  );
}

function ScheduleListPageInner({
  empty,
  selectedDay: selectedDayProp,
  view,
  onViewChange,
}: {
  empty?: boolean;
  selectedDay?: string;
  view: AdminScheduleCalendarView;
  onViewChange?: (next: AdminScheduleCalendarView) => void;
}) {
  const router = useRouter();
  const { principal } = useMockPrincipal();
  const canReadBookings = useCanAdminRoute("/bookings");
  const canOpenRoster = useCanAdminAction("roster-read");
  const sessionsQuery = useSuspenseQuery(adminSessionsQuery(principal));
  const bookingsQuery = useQuery({ ...adminBookingsQuery(principal), enabled: canReadBookings });
  const venuesQuery = useQuery(adminVenuesQuery(principal));
  const sessions = empty ? [] : sessionsQuery.data;
  const venues = venuesQuery.data ?? [];
  const branchCount = venues.filter((row) => row.kind === "BRANCH" && row.active).length;
  const bookings = bookingsQuery.data ?? [];
  const todayYmd = adminTodayYmd();
  const wide = useMinWidth(BALANSE_BREAKPOINTS.desktop);

  const [anchorDay, setAnchorDay] = useState(() => selectedDayProp ?? todayYmd);
  const [openDay, setOpenDay] = useState<string | null>(selectedDayProp ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const daySessions = openDay
    ? sessions
        .filter((session) => manilaYmd(session.startsAt) === openDay)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    : [];
  const selected =
    daySessions.find((session) => session.id === selectedId) ?? daySessions[0] ?? null;
  const repeatable = Boolean(
    selected && selected.status !== "CANCELLED" && !selected.recurrenceRuleId,
  );
  const rosterQuery = useQuery({
    ...adminSessionRosterQuery(principal, selected?.id ?? ""),
    enabled: Boolean(selected && !canReadBookings && canOpenRoster),
  });

  const inventory: SessionInventory | null = !selected
    ? null
    : rosterQuery.data
      ? {
          confirmed: rosterQuery.data.confirmedCount,
          held: rosterQuery.data.heldCount,
          available: rosterQuery.data.available,
          waitlisted: rosterQuery.data.waitlistedCount,
          checkedIn: rosterQuery.data.checkedIn,
          noShow: rosterQuery.data.noShow,
          lockedByCancellation: 0,
        }
      : canReadBookings && bookingsQuery.isPending && !bookingsQuery.data
        ? null
        : computeSessionInventory(
            selected,
            bookings.filter((booking) => booking.sessionId === selected.id),
          );

  function openDayPanel(ymd: string, sessionId: string | null = null) {
    setOpenDay(ymd);
    setAnchorDay(ymd);
    setSelectedId(sessionId);
  }

  function closePanel() {
    setOpenDay(null);
    setSelectedId(null);
  }

  // Escape closes the inline sidebar (the Sheet handles its own Escape).
  useEffect(() => {
    if (!openDay || !wide) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector("[role=dialog]")) return;
      setOpenDay(null);
      setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDay, wide]);

  const panel = openDay ? (
    <SelectedSessionPanel
      ymd={openDay}
      daySessions={daySessions}
      selectedSessionId={selected?.id ?? null}
      onSelectSession={setSelectedId}
      onClose={closePanel}
      inventory={inventory}
      hideClose={!wide}
    />
  ) : null;

  const actions = (
    <>
      <AdminCan action="schedule-recurrence">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" size="icon-sm" aria-label="Schedule tools" />
            }
          >
            <EllipsisIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/schedule/duplicate?from=${anchorDay}&to=${addCalendarDays(anchorDay, 6)}`,
                )
              }
            >
              <CopyIcon aria-hidden />
              Copy a date range
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!repeatable}
              onClick={() => {
                if (repeatable && selected) router.push(`/schedule/${selected.id}/recurrence`);
              }}
            >
              <RepeatIcon aria-hidden />
              {selected && repeatable
                ? `Repeat ${sessionDisplayName(selected)} weekly`
                : "Repeat a session weekly"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </AdminCan>
      <AdminCan action="schedule-create">
        <Button
          nativeButton={false}
          size="sm"
          render={<Link href={createSessionHref(openDay ?? anchorDay)} />}
        >
          <PlusIcon aria-hidden />
          New session
        </Button>
      </AdminCan>
    </>
  );

  return (
    <div
      className={cn(
        "-mx-4 -my-6 flex h-[calc(100dvh-4rem)] min-h-[36rem] overflow-hidden border-y border-border bg-card md:-mx-8 md:-my-8",
      )}
      data-slot="schedule-page"
    >
      <AdminScheduleCalendar
        className="min-w-0 flex-1"
        sessions={sessions}
        todayYmd={todayYmd}
        anchorDay={anchorDay}
        selectedDay={openDay}
        selectedSessionId={openDay ? (selected?.id ?? null) : null}
        view={view}
        onViewChange={(next) => onViewChange?.(next)}
        onNavigate={setAnchorDay}
        onOpenDay={(ymd) => openDayPanel(ymd)}
        onOpenSession={(session) => openDayPanel(manilaYmd(session.startsAt), session.id)}
        venueLabel={(session) => {
          const venue = venues.find((row) => row.id === session.venueId);
          if (!venue) return null;
          return venue.kind === "OFFSITE" || branchCount > 1 ? venue.name : null;
        }}
        actions={actions}
      />

      {wide ? (
        <aside
          aria-label="Selected day"
          className={cn(
            "min-h-0 shrink-0 overflow-hidden border-l border-border transition-[width] duration-200 ease-out",
            openDay ? "w-[25rem]" : "w-0 border-l-0",
          )}
        >
          <div className="h-full w-[25rem]">{panel}</div>
        </aside>
      ) : (
        <Sheet
          open={Boolean(openDay)}
          onOpenChange={(open) => {
            if (!open) closePanel();
          }}
        >
          <SheetContent
            side="right"
            className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
          >
            <SheetTitle className="sr-only">Selected day</SheetTitle>
            {panel}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
