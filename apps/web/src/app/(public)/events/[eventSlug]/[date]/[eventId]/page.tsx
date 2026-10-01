import {
  buildPublicEventPath,
  formatSessionDate,
  isCanonicalEventPath,
  slugify,
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
import { PublicEventPage } from "./_components/public-event-page/PublicEventPage";

type Params = { eventSlug: string; date: string; eventId: string };
type Props = {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function load(eventId: string) {
  return getMockAdapter().getPublicEventPage(decodeURIComponent(eventId));
}

function pathFor(event: NonNullable<Awaited<ReturnType<typeof load>>>) {
  return buildPublicEventPath({
    title: event.title,
    startsAt: event.session.startsAt,
    id: event.id,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = await load(eventId);
  if (!event) return { title: "Event not found" };
  const title = `${event.title} · ${formatSessionDate(event.session.startsAt)}`;
  const description = event.summary || event.session.venue?.name || "";
  const url = `${siteOrigin()}${pathFor(event)}`;
  const ended = event.status === "CANCELLED" || event.session.availability === "past";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    ...(ended ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { eventSlug, date, eventId } = await params;
  const query = await searchParams;
  const event = await load(eventId);
  if (!event) notFound();

  const path = pathFor(event);
  if (
    !isCanonicalEventPath(
      { eventSlug, date },
      { title: event.title, startsAt: event.session.startsAt },
    )
  ) {
    permanentRedirect(withQuery(path, query));
  }

  const context = await getPublicViewerContext(event.session.id);
  const roster = await getMockAdapter().getPublicRoster(event.session.id, context.viewer);
  if (!roster) notFound();

  const cancelled = event.status === "CANCELLED";
  const ended = !cancelled && event.session.availability === "past";

  return (
    <PublicEventPage
      event={event}
      roster={roster}
      viewer={context.viewer}
      existingBookingId={context.existingBookingId}
      currentPath={withQuery(path, query)}
      share={
        ended
          ? null
          : {
              url: shareUrlFor(path, context.shareParams),
              posterUrl: cancelled
                ? undefined
                : withShareParams(
                    `/share/poster/events/${encodeURIComponent(event.id)}`,
                    context.shareParams,
                  ),
              fileSlug: `${slugify(event.title, "event")}-${date}`,
            }
      }
      nowIso={MOCK_NOW_ISO}
    />
  );
}
