"use client";

import { addCalendarDays, computeSessionInventory, manilaYmd } from "@balanse/domain";
import { Button, DetailPageSkeleton, FeedbackState } from "@balanse/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import {
  AdminScheduleCalendar,
  type AdminScheduleCalendarView,
} from "@/components/balanse/schedule-calendar/AdminScheduleCalendar";
import { adminTodayYmd } from "@/lib/clock";
import { adminBookingsQuery, adminSessionsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { createSessionHref } from "../../_lib/schedule-href";
import { SelectedSessionPanel } from "../selected-session-panel/SelectedSessionPanel";

const SCHEDULE_VIEWS = ["auto", "month", "week", "day"] as const;

export function ScheduleListPage({
  empty,
  selectedDay: selectedDayProp,
  view: viewProp,
}: {
  empty?: boolean;
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
  const sessionsQuery = useSuspenseQuery(adminSessionsQuery(principal));
  const bookingsQuery = useQuery(adminBookingsQuery(principal));
  const sessions = empty ? [] : sessionsQuery.data;
  const bookings = bookingsQuery.data ?? [];
  const todayYmd = adminTodayYmd();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(() => selectedDayProp ?? todayYmd);

  const daySessions = (sessions ?? []).filter(
    (session) => manilaYmd(session.startsAt) === selectedDay,
  );
  const selected =
    daySessions.find((session) => session.id === selectedId) ?? daySessions[0] ?? null;

  return (
    <AdminPageShell
      title="Schedule"
      actions={
        <>
          <Button
            nativeButton={false}
            variant="outline"
            render={
              <Link
                href={`/schedule/duplicate?from=${selectedDay}&to=${addCalendarDays(selectedDay, 6)}`}
              />
            }
          >
            <Copy className="size-4" aria-hidden />
            Duplicate range
          </Button>
          <Button nativeButton={false} render={<Link href={createSessionHref(selectedDay)} />}>
            Create Session
          </Button>
        </>
      }
    >
      {sessions.length === 0 ? <FeedbackState id="admin.no-sessions" /> : null}
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-6">
        <div className="overflow-hidden rounded-xl border border-border">
          <AdminScheduleCalendar
            sessions={sessions ?? []}
            todayYmd={todayYmd}
            selectedDay={selectedDay}
            selectedSessionId={selected?.id ?? null}
            view={view}
            onViewChange={(next) => onViewChange?.(next)}
            onSelectDay={(ymd) => {
              setSelectedDay(ymd);
              const match = (sessions ?? []).find((session) => manilaYmd(session.startsAt) === ymd);
              setSelectedId(match?.id ?? null);
            }}
            onSelectSession={setSelectedId}
            onCreateSession={(ymd) => router.push(createSessionHref(ymd))}
          />
        </div>
        <div className="mt-8 xl:sticky xl:top-8 xl:mt-0">
          {bookingsQuery.isPending && !bookingsQuery.data && selected ? (
            <DetailPageSkeleton label="Loading schedule" />
          ) : selected ? (
            <div className="grid gap-3">
              <SelectedSessionPanel
                session={selected}
                daySessions={daySessions}
                onSelectSession={setSelectedId}
                inventory={computeSessionInventory(
                  selected,
                  bookings.filter((booking) => booking.sessionId === selected.id),
                )}
              />
              <CreateOnDateCard ymd={selectedDay} />
            </div>
          ) : (
            <EmptyDayPanel ymd={selectedDay} />
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}

function EmptyDayPanel({ ymd }: { ymd: string }) {
  return (
    <aside className="rounded-xl border border-dashed border-border bg-card p-4">
      <h2 className="font-display text-2xl">No sessions</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Nothing is scheduled on {ymd}. Create a session on this date.
      </p>
      <div className="mt-4">
        <Button nativeButton={false} render={<Link href={createSessionHref(ymd)} />}>
          Create session
        </Button>
      </div>
    </aside>
  );
}

function CreateOnDateCard({ ymd }: { ymd: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      <Link className="underline underline-offset-4" href={createSessionHref(ymd)}>
        Create another session
      </Link>{" "}
      on {ymd}.
    </p>
  );
}
