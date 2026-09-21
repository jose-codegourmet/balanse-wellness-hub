import type { Metadata } from "next";
import { loadPublicSchedule } from "@/modules/schedule/load-schedule";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Customer schedule calendar.",
};

export default async function Page() {
  const schedule = await loadPublicSchedule();
  return (
    <section className="w-full pt-12 pb-12 px-0">
      <div className="max-w-6xl px-4">
        <h1 className="font-display text-3xl">Schedule</h1>
      </div>
      <div className="mt-6">
        <ScheduleCalendarSection
          audience="customer"
          initialSessions={schedule.sessions}
          initialClasses={schedule.classes}
          initialCoaches={schedule.coaches}
          initialLoadError={schedule.loadError}
        />
      </div>
    </section>
  );
}
