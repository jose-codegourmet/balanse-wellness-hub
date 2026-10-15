import { listPublicCoaches } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { CoachesPage } from "./_components/coaches-page/CoachesPage";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Meet the Balansé coaching roster.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const { items: coaches } = await listPublicCoaches(serverFetcher(null));
  return <CoachesPage coaches={coaches} />;
}
