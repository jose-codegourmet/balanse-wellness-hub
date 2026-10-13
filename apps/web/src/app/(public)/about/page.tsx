import { getPublicContent, listPublicCoaches } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { AboutPage } from "./_components/about-page/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description: "About Balansé Wellness Hub — movement, wellness, and community in Cebu.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const [{ items: coaches }, content] = await Promise.all([
    listPublicCoaches(serverFetcher(null)),
    getPublicContent(serverFetcher(null)),
  ]);
  return <AboutPage coaches={coaches} about={content.about} />;
}
