import type { Metadata } from "next";
import { BalanseBookingHero } from "@/components/balanse/marketing/booking-hero/BalanseBookingHero";
import { loadPublicSchedule } from "@/modules/schedule/load-schedule";

export const metadata: Metadata = {
  title: "Quick booking",
  description:
    "Choose a Balansé class, find an available time, and reserve your space in Cebu City.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ coachId?: string | string[]; classId?: string | string[] }>;
}) {
  const [params, schedule] = await Promise.all([searchParams, loadPublicSchedule()]);
  return (
    <BalanseBookingHero
      {...schedule}
      bookingMode="quick"
      coachId={typeof params.coachId === "string" ? params.coachId : "all"}
      classId={typeof params.classId === "string" ? params.classId : "all"}
    />
  );
}
