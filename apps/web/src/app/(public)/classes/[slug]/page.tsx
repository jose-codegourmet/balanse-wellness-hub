import { listPublicSessions } from "@balanse/api-client";
import { isClassRedirectUrl } from "@balanse/domain";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getClassCatalogue } from "@/lib/class-catalogue";
import { serverFetcher } from "@/lib/query/fetcher";
import { SHOWCASE_SCHEDULE_RANGE } from "@/modules/schedule/showcase-range";
import { ClassDetailPage } from "./_components/class-detail-page/ClassDetailPage";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const preview = (await searchParams).preview === "1";
  const gymClass = (await getClassCatalogue()).classes.find((item) => item.slug === slug);
  return {
    title: preview ? "Class preview" : (gymClass?.name ?? "Class not found"),
    description: gymClass?.shortDescription,
    ...(preview ? { robots: { index: false, follow: false } } : {}),
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const preview = (await searchParams).preview === "1";
  const [{ classes, coaches }, { items: sessions }] = await Promise.all([
    getClassCatalogue(),
    listPublicSessions(serverFetcher(null), SHOWCASE_SCHEDULE_RANGE),
  ]);
  const gymClass = classes.find((item) => item.slug === slug) ?? null;
  if (!gymClass && !preview) notFound();
  if (!preview && gymClass?.customPageUrl && isClassRedirectUrl(gymClass.customPageUrl))
    redirect(gymClass.customPageUrl);
  return (
    <ClassDetailPage gymClass={gymClass} coaches={coaches} sessions={sessions} preview={preview} />
  );
}
