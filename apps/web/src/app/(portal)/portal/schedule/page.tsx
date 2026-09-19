import type { Metadata } from "next";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Customer schedule calendar.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Schedule</h1>
      <div className="mt-6">
        <ScheduleCalendarSection audience="customer" />
      </div>
    </section>
  );
}
