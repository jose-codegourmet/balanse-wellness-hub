"use client";

import { listPublicClasses, listPublicSessions } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { BalanseBookingCalendar } from "@/components/balanse/calendar/BalanseBookingCalendar";
import { BalanseQuickBooking } from "@/components/balanse/calendar/BalanseQuickBooking";
import { myBookingsQuery } from "@/lib/query/bookings";
import { SHOWCASE_SCHEDULE_RANGE } from "@/modules/schedule/showcase-range";
import { useSession } from "@/modules/session/SessionProvider";
import { useViewerShareParams } from "@/modules/share/use-viewer-share-params";

export function ScheduleCalendarSection({
  audience,
  initialSessions,
  initialClasses,
  initialCoaches = [],
  initialLoadError = false,
  initialClassFilter = "all",
  initialCoachFilter = "all",
  presentation = "calendar",
}: {
  audience: "guest" | "customer";
  initialSessions: PublicSession[];
  initialClasses: PublicClass[];
  initialCoaches?: PublicCoach[];
  initialLoadError?: boolean;
  initialClassFilter?: string;
  initialCoachFilter?: string;
  presentation?: "quick" | "calendar";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const customerId = useSession()?.customerId ?? null;
  const [sessions, setSessions] = useState(initialSessions);
  const [classes, setClasses] = useState(initialClasses);
  const bookingsQuery = useQuery({
    ...myBookingsQuery(customerId ?? "", apiFetchBrowser),
    enabled: audience === "customer" && Boolean(customerId),
  });
  const bookingSessionIds = useMemo(
    () => bookingsQuery.data?.map((booking) => booking.sessionId) ?? [],
    [bookingsQuery.data],
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(initialLoadError);
  const shareParams = useViewerShareParams();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [nextSessions, nextClasses] = await Promise.all([
        listPublicSessions(apiFetchBrowser, SHOWCASE_SCHEDULE_RANGE).then((res) => res.items),
        listPublicClasses(apiFetchBrowser).then((res) => res.items),
      ]);
      setSessions(nextSessions);
      setClasses(nextClasses);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // The portal shows the full bookable timetable, like the marketing calendar;
  // the signed-in customer's own sessions are marked via `viewerBookingSessionIds`.
  const Calendar = presentation === "quick" ? BalanseQuickBooking : BalanseBookingCalendar;

  return (
    <Calendar
      sessions={sessions}
      classes={classes}
      coaches={initialCoaches}
      nowIso={new Date().toISOString()}
      audience={audience}
      loading={loading}
      loadError={loadError}
      sessionBecameFullId={null}
      viewerBookingSessionIds={bookingSessionIds}
      shareParams={shareParams}
      onRetry={() => void load()}
      initialClassFilter={initialClassFilter}
      initialCoachFilter={initialCoachFilter}
      onClearFilter={() => {
        if (pathname === "/book/quick" || pathname === "/book/calendar") {
          router.replace(pathname, { scroll: false });
        } else if (pathname === "/") {
          router.replace("/", { scroll: false });
        }
      }}
      onReserve={(session) => {
        const waitlist = !session.reservable && session.availability === "full_with_waitlist";
        const bookingPath = waitlist
          ? `/portal/book/${session.id}?intent=waitlist`
          : `/portal/book/${session.id}`;
        if (!customerId) {
          router.push(`/login?returnTo=${encodeURIComponent(bookingPath)}`);
          return;
        }
        router.push(bookingPath);
      }}
    />
  );
}
