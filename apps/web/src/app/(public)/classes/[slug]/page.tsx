import { isClassRedirectUrl } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getClassCatalogue } from "@/lib/class-catalogue";
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
  const adapter = getMockAdapter();
  const [{ classes, coaches }, sessions] = await Promise.all([
    getClassCatalogue(),
    adapter.getPublicSessions(),
  ]);
  const gymClass = classes.find((item) => item.slug === slug) ?? null;
  if (!gymClass && !preview) notFound();
  if (!preview && gymClass?.customPageUrl && isClassRedirectUrl(gymClass.customPageUrl))
    redirect(gymClass.customPageUrl);
  return (
    <ClassDetailPage gymClass={gymClass} coaches={coaches} sessions={sessions} preview={preview} />
  );
}
