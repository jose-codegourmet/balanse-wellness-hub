import { publicPageSlotIds } from "@balanse/domain";
import { MarketingImage } from "@balanse/ui";
import type { Metadata } from "next";
import { loadPublicSchedule } from "@/modules/schedule/load-schedule";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Browse Balansé class sessions on the Cebu calendar.",
};

export default async function Page() {
  const slots = publicPageSlotIds("landing");
  const schedule = await loadPublicSchedule();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <p className="max-w-2xl text-lg text-muted-foreground">
        Find your balance. Choose a class and reserve your spot.
      </p>
      <div className="mt-6 max-w-xl">
        <MarketingImage assetId={slots[0] ?? "landing-a"} />
      </div>
      <div id="schedule" className="mt-8 scroll-mt-24">
        <h1 className="font-display text-3xl">This week at Balansé</h1>
        <div className="mt-6">
          <ScheduleCalendarSection
            audience="guest"
            initialSessions={schedule.sessions}
            initialClasses={schedule.classes}
            initialLoadError={schedule.loadError}
          />
        </div>
      </div>
      <div id="classes" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-2xl">Classes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the calendar filters. There is no separate Classes page (OQ-NAV).
        </p>
        <div className="mt-4 max-w-xl">
          <MarketingImage assetId={slots[1] ?? "landing-b"} />
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <MarketingImage assetId={slots[2] ?? "landing-c"} />
        <MarketingImage assetId={slots[3] ?? "landing-d"} />
      </div>
    </section>
  );
}
