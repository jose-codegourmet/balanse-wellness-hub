import { listPublicCoaches } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { loadPublicSchedule } from "@/modules/schedule/load-schedule";
import { LandingPage } from "./_components/landing-page/LandingPage";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Find your balance. Browse Balansé classes on the Cebu calendar and reserve a spot.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ coachId?: string; classId?: string }>;
}) {
  const params = await searchParams;
  const [schedule, { items: coaches }] = await Promise.all([
    loadPublicSchedule(),
    listPublicCoaches(serverFetcher(null)),
  ]);
  return (
    <LandingPage
      coaches={coaches}
      sessions={schedule.sessions}
      classes={schedule.classes}
      loadError={schedule.loadError}
      coachId={params.coachId ?? "all"}
      classId={params.classId ?? "all"}
    />
  );
}
