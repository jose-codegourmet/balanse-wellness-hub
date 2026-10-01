import {
  formatSessionDate,
  formatSessionTime,
  formatSessionTimeRange,
  publicImageSrc,
  registrationWindowState,
} from "@balanse/domain";
import { Badge } from "@balanse/ui";
import { ArrowLeft, Backpack, CalendarClock, CalendarX2, HeartHandshake } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ClassGallery } from "@/components/balanse/class-gallery/ClassGallery";
import { PublicBookingBar } from "@/components/balanse/public-booking-bar/PublicBookingBar";
import { PublicRoster } from "@/components/balanse/public-roster/PublicRoster";
import { PublicSessionDetails } from "@/components/balanse/public-session-details/PublicSessionDetails";
import { ShareAction } from "@/components/balanse/share-action/ShareAction";
import type { PublicEventPageProps } from "./PublicEventPage.meta";

function when(iso: string) {
  return `${formatSessionDate(iso)}, ${formatSessionTime(iso)}`;
}

export function PublicEventPage({
  event,
  roster,
  viewer,
  existingBookingId,
  currentPath,
  share,
  nowIso,
}: PublicEventPageProps) {
  const { session } = event;
  const cancelled = event.status === "CANCELLED";
  const ended = !cancelled && session.availability === "past";
  const poster = publicImageSrc(event.posterImage) ?? session.heroImage;
  const gallery = event.galleryImages
    .map((image) => publicImageSrc(image))
    .filter((image): image is string => Boolean(image));
  const windowState = registrationWindowState(event, nowIso);
  const returnTo = encodeURIComponent(currentPath);
  const subtitle = `${formatSessionDate(session.startsAt)} · ${formatSessionTimeRange(
    session.startsAt,
    session.endsAt,
  )}${session.venue ? ` · ${session.venue.name}` : ""}`;

  return (
    <article className="pb-16">
      <header className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        {poster ? (
          <Image
            src={poster}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
            unoptimized={poster.startsWith("http")}
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgba(16,29,29,0.92)] via-[rgba(16,29,29,0.6)] to-[rgba(16,29,29,0.25)]" />
        <div className="marketing-container flex min-h-[30rem] flex-col justify-between gap-10 py-8 sm:min-h-[34rem]">
          <Link
            href="/book/calendar"
            className="inline-flex w-fit items-center gap-2 text-sm opacity-90 hover:opacity-100"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Full schedule
          </Link>
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-90">
                Balansé event
              </p>
              <Badge variant={cancelled ? "danger" : "accent"} appearance="soft">
                {cancelled ? "Cancelled" : ended ? "Ended" : "Event"}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">{event.title}</h1>
            {event.summary ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed opacity-90 sm:text-lg">
                {event.summary}
              </p>
            ) : null}
            <p className="mt-4 text-sm font-medium opacity-90">{subtitle}</p>
            {share ? (
              <div className="mt-6">
                <ShareAction
                  url={share.url}
                  title={event.title}
                  subtitle={subtitle}
                  posterUrl={share.posterUrl}
                  fileSlug={share.fileSlug}
                  variant="secondary"
                  label="Share this event"
                />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="marketing-container mt-8 flex flex-col gap-10">
        {cancelled ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-border bg-secondary p-5"
          >
            <CalendarX2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-display text-xl">This event was cancelled</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The studio will contact everyone who registered.{" "}
                <Link href="/book/calendar" className="underline underline-offset-4">
                  See what&rsquo;s on
                </Link>
                .
              </p>
            </div>
          </div>
        ) : null}
        {ended ? (
          <div role="status" className="rounded-2xl border border-border bg-secondary p-5">
            <p className="font-display text-xl">This event has ended</p>
            {event.beneficiary ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Thank you for supporting {event.beneficiary}.
              </p>
            ) : null}
          </div>
        ) : null}
        {!cancelled && !ended && windowState.state === "not_open" ? (
          <p className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm">
            <CalendarClock aria-hidden="true" className="size-4 text-accent" />
            Registration opens {when(windowState.opensAt)}. Share it with friends so you can go
            together.
          </p>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-10">
            {event.description ? (
              <section aria-labelledby="event-about" className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  The event
                </p>
                <h2 id="event-about" className="mt-1 font-display text-2xl">
                  About this event
                </h2>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </section>
            ) : null}
            {event.beneficiary || event.whatToBring ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {event.beneficiary ? (
                  <section className="rounded-2xl border border-border bg-card p-5">
                    <HeartHandshake aria-hidden="true" className="size-5 text-accent" />
                    <h2 className="mt-3 font-display text-xl">Supporting</h2>
                    <p className="mt-1 text-sm leading-relaxed">{event.beneficiary}</p>
                  </section>
                ) : null}
                {event.whatToBring ? (
                  <section className="rounded-2xl border border-border bg-card p-5">
                    <Backpack aria-hidden="true" className="size-5 text-accent" />
                    <h2 className="mt-3 font-display text-xl">What to bring</h2>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                      {event.whatToBring}
                    </p>
                  </section>
                ) : null}
              </div>
            ) : null}
            <PublicSessionDetails session={session} showClassBlurb={false} />
            <Link
              href={`/classes/${encodeURIComponent(session.classSlug)}`}
              className="w-fit text-sm font-medium underline underline-offset-4"
            >
              About the class: {session.className}
            </Link>
          </div>
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <PublicRoster
              roster={roster}
              loginHref={`/login?returnTo=${returnTo}`}
              signUpHref={`/sign-up?returnTo=${returnTo}`}
              state={cancelled ? "cancelled" : ended ? "ended" : "live"}
            />
            <PublicBookingBar
              session={session}
              viewer={viewer}
              existingBookingId={existingBookingId}
              registrationWindow={event}
              cancelled={cancelled}
              nowIso={nowIso}
            />
          </div>
        </div>
      </div>
      {gallery.length ? (
        <div className="mt-12">
          <ClassGallery images={gallery} name={event.title} />
        </div>
      ) : null}
    </article>
  );
}
