import {
  formatSessionDate,
  formatSessionTimeRange,
  sessionAvailabilityLabel,
  sessionDisplayName,
} from "@balanse/domain";
import { Badge } from "@balanse/ui";
import { ArrowLeft, ArrowUpRight, CalendarX2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PublicBookingBar } from "@/components/balanse/public-booking-bar/PublicBookingBar";
import { PublicRoster } from "@/components/balanse/public-roster/PublicRoster";
import { PublicSessionDetails } from "@/components/balanse/public-session-details/PublicSessionDetails";
import { ShareAction } from "@/components/balanse/share-action/ShareAction";
import type { PublicSessionPageProps } from "./PublicSessionPage.meta";

export function PublicSessionPage({
  session,
  roster,
  viewer,
  existingBookingId,
  currentPath,
  eventHref,
  share,
  nowIso,
}: PublicSessionPageProps) {
  const title = sessionDisplayName(session);
  const cancelled = session.status === "CANCELLED" || session.availability === "cancelled";
  const ended = !cancelled && session.availability === "past";
  const returnTo = encodeURIComponent(currentPath);
  const subtitle = `${formatSessionDate(session.startsAt)} · ${formatSessionTimeRange(
    session.startsAt,
    session.endsAt,
  )}${session.venue ? ` · ${session.venue.name}` : ""}`;

  return (
    <article className="pb-16">
      <header className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        {session.heroImage ? (
          <Image
            src={session.heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
            unoptimized={session.heroImage.startsWith("https:")}
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(16,29,29,0.88)] via-[rgba(16,29,29,0.6)] to-[rgba(16,29,29,0.2)]" />
        <div className="marketing-container flex min-h-[26rem] flex-col justify-between gap-10 py-8 sm:min-h-[30rem]">
          <Link
            href="/book/calendar"
            className="inline-flex w-fit items-center gap-2 text-sm opacity-90 hover:opacity-100"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Full schedule
          </Link>
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              {title !== session.className ? (
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-90">
                  {session.className}
                </p>
              ) : null}
              <Badge variant={cancelled ? "danger" : "accent"} appearance="soft">
                {sessionAvailabilityLabel(session.availability)}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 text-base opacity-90 sm:text-lg">{subtitle}</p>
            {share ? (
              <div className="mt-6">
                <ShareAction
                  url={share.url}
                  title={title}
                  subtitle={subtitle}
                  posterUrl={share.posterUrl}
                  fileSlug={share.fileSlug}
                  variant="secondary"
                  label="Share with friends"
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
              <p className="font-display text-xl">This session was cancelled</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Bookings for this session are being handled by the studio.{" "}
                <Link href="/book/calendar" className="underline underline-offset-4">
                  Find another session
                </Link>
                .
              </p>
            </div>
          </div>
        ) : null}
        {ended ? (
          <div role="status" className="rounded-2xl border border-border bg-secondary p-5">
            <p className="font-display text-xl">This session has ended</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Thanks to everyone who came. Catch the next one on the schedule.
            </p>
          </div>
        ) : null}

        {eventHref && session.event ? (
          <Link
            href={eventHref}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/60"
          >
            <span className="flex items-center gap-3">
              <Sparkles aria-hidden="true" className="size-5 text-accent" />
              <span>
                Part of <strong className="font-semibold">{session.event.title}</strong>
              </span>
            </span>
            <ArrowUpRight aria-hidden="true" className="size-5" />
          </Link>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <PublicSessionDetails session={session} />
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
              nowIso={nowIso}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
