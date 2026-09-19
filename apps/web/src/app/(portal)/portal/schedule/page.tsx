import { CalendarSkeleton } from "@balanse/ui";
import type { Metadata } from "next";
import { Suspense } from "react";
import { loadPublicSchedule } from "@/modules/schedule/load-schedule";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Customer schedule calendar.",
};

export default async function Page() {
  const schedule = await loadPublicSchedule();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Schedule</h1>
      <div className="mt-6">
        <Suspense fallback={<CalendarSkeleton />}>
          <ScheduleCalendarSection
            audience="customer"
            initialSessions={schedule.sessions}
            initialClasses={schedule.classes}
            initialLoadError={schedule.loadError}
          />
        </Suspense>
      </div>
    </section>
  );
}
