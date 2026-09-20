"use client";

import {
  computeSessionInventory,
  formatSessionTime,
  localDateFromYmd,
  manilaYmd,
  startOfManilaMonth,
  ymdFromLocalDate,
} from "@balanse/domain";
import { Button, DetailPageSkeleton, FeedbackState } from "@balanse/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { FullscreenCalendar } from "@/components/jabkit/fullscreen-calendar";
import type { FullscreenCalendarDay } from "@/components/jabkit/fullscreen-calendar/FullscreenCalendar.types";
import { adminTodayYmd } from "@/lib/clock";
import { adminBookingsQuery, adminSessionsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { SelectedSessionPanel } from "./SelectedSessionPanel";
import { createSessionHref } from "./schedule-href";

export function ScheduleListPage({
  empty,
  selectedDay: selectedDayProp,
}: {
  empty?: boolean;
  selectedDay?: string;
}) {
  const router = useRouter();
  const { principal } = useMockPrincipal();
  const sessionsQuery = useSuspenseQuery(adminSessionsQuery(principal.role));
  const bookingsQuery = useQuery(adminBookingsQuery(principal.role));
  const sessions = empty ? [] : sessionsQuery.data;
  const bookings = bookingsQuery.data ?? [];
  const todayYmd = adminTodayYmd();
  const [cursor, setCursor] = useState(() => startOfManilaMonth(todayYmd));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(() => selectedDayProp ?? todayYmd);

  const calendarData = useMemo<FullscreenCalendarDay[]>(() => {
    const byDay = new Map<string, FullscreenCalendarDay["events"]>();
    for (const session of sessions ?? []) {
      const ymd = manilaYmd(session.startsAt);
      const events = byDay.get(ymd) ?? [];
      events.push({
        id: session.id,
        name: session.className,
        time: formatSessionTime(session.startsAt),
      });
      byDay.set(ymd, events);
    }
    return [...byDay.entries()].map(([ymd, events]) => ({
      day: localDateFromYmd(ymd),
      events,
    }));
  }, [sessions]);

  const daySessions = (sessions ?? []).filter(
    (session) => manilaYmd(session.startsAt) === selectedDay,
  );
  const selected =
    daySessions.find((session) => session.id === selectedId) ?? daySessions[0] ?? null;

  return (
    <AdminPageShell
      title="Schedule"
      actions={
        <Button nativeButton={false} render={<Link href={createSessionHref(selectedDay)} />}>
          Create Session
        </Button>
      }
    >
      {sessions.length === 0 ? <FeedbackState id="admin.no-sessions" /> : null}
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-6">
        <div className="overflow-hidden rounded-xl border border-border">
          <FullscreenCalendar
            className="min-h-0"
            data={calendarData}
            today={localDateFromYmd(todayYmd)}
            defaultMonth={localDateFromYmd(cursor)}
            defaultSelectedDay={localDateFromYmd(selectedDay)}
            addEventLabel="Create Session"
            onMonthChange={(month) => setCursor(startOfManilaMonth(ymdFromLocalDate(month)))}
            onSelectDay={(day) => {
              const ymd = ymdFromLocalDate(day);
              setSelectedDay(ymd);
              const match = (sessions ?? []).find((session) => manilaYmd(session.startsAt) === ymd);
              setSelectedId(match?.id ?? null);
            }}
            onAddEvent={(day) => router.push(createSessionHref(ymdFromLocalDate(day)))}
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
