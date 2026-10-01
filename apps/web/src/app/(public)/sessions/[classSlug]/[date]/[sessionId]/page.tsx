import {
  buildPublicEventPath,
  buildPublicSessionPath,
  formatSessionDate,
  formatSessionTime,
  isCanonicalSessionPath,
  sessionDisplayName,
  withShareParams,
} from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getPublicViewerContext,
  shareUrlFor,
  siteOrigin,
  withQuery,
} from "@/modules/share/public-page";
import { PublicSessionPage } from "./_components/public-session-page/PublicSessionPage";

type Params = { classSlug: string; date: string; sessionId: string };
type Props = {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function load(sessionId: string) {
  return getMockAdapter().getPublicSessionPage(decodeURIComponent(sessionId));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;
  const session = await load(sessionId);
  if (!session) return { title: "Session not found" };
  const title = `${sessionDisplayName(session)} · ${formatSessionDate(session.startsAt)}, ${formatSessionTime(
    session.startsAt,
  )}`;
  const description = [session.venue?.name, session.coachName].filter(Boolean).join(" · ");
  const path = buildPublicSessionPath({ ...session, id: session.id });
  const ended = session.availability === "past" || session.availability === "cancelled";
  return {
    title,
    description,
    alternates: { canonical: `${siteOrigin()}${path}` },
    openGraph: { title, description, url: `${siteOrigin()}${path}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    ...(ended ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { classSlug, date, sessionId } = await params;
  const query = await searchParams;
  const session = await load(sessionId);
  if (!session) notFound();

  const path = buildPublicSessionPath(session);
  if (!isCanonicalSessionPath({ classSlug, date }, session)) {
    permanentRedirect(withQuery(path, query));
  }

  const context = await getPublicViewerContext(session.id);
  const roster = await getMockAdapter().getPublicRoster(session.id, context.viewer);
  if (!roster) notFound();

  const shareable = session.availability !== "past";
  const posterable = shareable && session.availability !== "cancelled";
  const eventHref = session.event
    ? buildPublicEventPath({
        title: session.event.title,
        startsAt: session.startsAt,
        id: session.event.id,
      })
    : null;

  return (
    <PublicSessionPage
      session={session}
      roster={roster}
      viewer={context.viewer}
      existingBookingId={context.existingBookingId}
      currentPath={withQuery(path, query)}
      eventHref={eventHref}
      share={
        shareable
          ? {
              url: shareUrlFor(path, context.shareParams),
              posterUrl: posterable
                ? withShareParams(
                    `/share/poster/sessions/${encodeURIComponent(session.id)}`,
                    context.shareParams,
                  )
                : undefined,
              fileSlug: `${session.classSlug}-${date}`,
            }
          : null
      }
      nowIso={MOCK_NOW_ISO}
    />
  );
}
