import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
import {
  ABOUT_CLASS_FAMILIES,
  BOOKING_STEPS,
  LANDING_HERO_COPY,
  landingScheduleHref,
} from "@balanse/domain";
import { MarketingImage } from "@balanse/ui";
import Link from "next/link";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";
import { CoachPreviewCard } from "./CoachPreviewCard";

export function LandingPage({
  coaches,
  sessions,
  classes,
  loadError,
  coachId = "all",
  classId = "all",
}: {
  coaches: PublicCoach[];
  sessions: PublicSession[];
  classes: PublicClass[];
  loadError: boolean;
  coachId?: string;
  classId?: string;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(42rem,70vh)] overflow-hidden">
        <MarketingImage
          assetId="landing-a"
          decorative
          className="size-full rounded-none opacity-35"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10">
        <p
          data-section="hero-copy"
          className="max-w-2xl font-display text-2xl text-foreground md:text-3xl"
        >
          {LANDING_HERO_COPY}
        </p>

        <section
          id="schedule"
          data-section="calendar-hero"
          className="mt-8 scroll-mt-24 rounded-2xl border border-border bg-card/95 p-4 shadow-sm md:p-6"
        >
          <h1 className="font-display text-3xl">This week at Balansé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse openly. Reserve or join the waitlist after you sign in — the selected session
            stays with you.
          </p>
          <div className="mt-6">
            <ScheduleCalendarSection
              audience="guest"
              initialSessions={sessions}
              initialClasses={classes}
              initialCoaches={coaches}
              initialLoadError={loadError}
              initialCoachFilter={coachId}
              initialClassFilter={classId}
            />
          </div>
        </section>

        <section data-section="how-it-works" className="mt-16 grid gap-6 md:grid-cols-[12rem_1fr]">
          <MarketingImage assetId="landing-c" className="max-w-xs" />
          <div>
            <h2 className="font-display text-2xl">How it works</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {BOOKING_STEPS.map((step, index) => (
                <li key={step} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 font-medium">{step}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-muted-foreground">
              Payment is manual (GCash or Pay at Counter). An admin confirms the booking.
            </p>
          </div>
        </section>

        <section id="classes" data-section="classes" className="mt-16 scroll-mt-24">
          <h2 className="font-display text-2xl">Classes</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            A weekly mix of movement. Filter the calendar above — there is no separate Classes page.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ABOUT_CLASS_FAMILIES.map((name) => (
              <li
                key={name}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-sm"
              >
                {name}
              </li>
            ))}
          </ul>
          <div className="mt-6 max-w-2xl">
            <MarketingImage assetId="landing-b" />
          </div>
        </section>

        <section id="coaches" data-section="coaches" className="mt-16 scroll-mt-24">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl">Coaches</h2>
            <Link href="/coaches" className="text-sm underline underline-offset-4">
              Meet the team
            </Link>
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
              <li key={coach.id}>
                <CoachPreviewCard coach={coach} />
              </li>
            ))}
          </ul>
        </section>

        <section data-section="about" className="mt-16 max-w-3xl">
          <h2 className="font-display text-2xl">About Balansé</h2>
          <p className="mt-3 text-muted-foreground">
            At Balansé, we promote holistic wellness by combining movement, fitness education,
            recovery, and tranquility. Join us for workshops, classes, and community support.
          </p>
          <Link href="/about" className="mt-3 inline-block text-sm underline underline-offset-4">
            More about the studio
          </Link>
        </section>

        <section data-section="location" className="mt-16 max-w-3xl">
          <h2 className="font-display text-2xl">Location / walking in</h2>
          <p className="mt-3 text-muted-foreground">
            Unit 2A, Capitol Centrum Building, N Escario, Cebu City, 6000. Walking in is the same
            booking path: scan the Balansé QR, sign in or create an account, then reserve on this
            calendar. There is no separate walk-in desk booking channel.
          </p>
        </section>
      </div>

      <section data-section="final-cta" className="relative mt-8 overflow-hidden">
        <MarketingImage
          assetId="landing-d"
          decorative
          className="absolute inset-0 size-full rounded-none"
        />
        <div className="absolute inset-0 bg-background/75" />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl">Ready to move?</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Choose a class on the calendar and reserve your spot.
          </p>
          <a
            href={landingScheduleHref()}
            className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            View the schedule
          </a>
        </div>
      </section>
    </div>
  );
}
