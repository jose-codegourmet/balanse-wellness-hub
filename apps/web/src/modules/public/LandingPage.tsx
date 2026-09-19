import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
import {
  ABOUT_CLASS_FAMILIES,
  BOOKING_STEPS,
  CONTACT_DETAILS,
  CREATE_ACCOUNT_ACTION,
  LANDING_HERO_COPY,
  landingScheduleHref,
} from "@balanse/domain";
import { MarketingImage, SectionHeading } from "@balanse/ui";
import Link from "next/link";
import { BalanseCtaSection } from "@/components/balanse/marketing/BalanseCtaSection";
import { BalanseHero } from "@/components/balanse/marketing/BalanseHero";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";
import { CoachPreviewCard } from "./CoachPreviewCard";

const HERO_TITLE_LINES = LANDING_HERO_COPY.split(". ")
  .filter(Boolean)
  .map((line, index, all) => (index === all.length - 1 ? line : `${line}.`));

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
    <div>
      <BalanseHero
        assetId="landing-a"
        eyebrow="Cebu City · Movement, wellness, community"
        titleLines={HERO_TITLE_LINES}
        primaryAction={{ label: "Browse this week", href: landingScheduleHref() }}
        secondaryAction={{ label: CREATE_ACCOUNT_ACTION.label, href: CREATE_ACCOUNT_ACTION.href }}
        features={[
          {
            icon: "monitor",
            title: "Book on the calendar",
            description: "Browse as a guest, then reserve\nonce you are signed in.",
          },
          {
            icon: "armchair",
            title: "Recovery is part of it",
            description: "Movement, education, and rest\nin one dedicated space.",
          },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        <section
          id="schedule"
          data-section="calendar-hero"
          className="scroll-mt-24 rounded-2xl border border-[var(--balanse-tan)]/50 bg-card/95 p-4 shadow-[0_18px_50px_-30px_var(--balanse-navy)] md:p-6"
        >
          <SectionHeading
            eyebrow="This week"
            title="This week at Balansé"
            description="Browse openly. Reserve or join the waitlist after you sign in — the selected session stays with you."
          />
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

        <section data-section="how-it-works" className="mt-16 md:mt-20">
          <SectionHeading
            eyebrow="Four steps"
            title="How it works"
            description="Payment is manual — GCash or Pay at Counter. An admin confirms the booking once it clears."
          />
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_16rem] md:items-start">
            <ol className="grid gap-3 sm:grid-cols-2">
              {BOOKING_STEPS.map((step, index) => (
                <li
                  key={step}
                  className="rounded-xl border border-[var(--balanse-tan)]/50 bg-card p-5 transition-colors hover:border-accent"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-secondary font-display text-sm text-foreground">
                    {index + 1}
                  </span>
                  <p className="mt-3 font-medium">{step}</p>
                </li>
              ))}
            </ol>
            <MarketingImage assetId="landing-c" className="md:sticky md:top-24" />
          </div>
        </section>

        <section id="classes" data-section="classes" className="mt-16 scroll-mt-24 md:mt-20">
          <SectionHeading
            eyebrow="What we run"
            title="Classes"
            description="A weekly mix of movement. Filter the calendar above — there is no separate Classes page."
            action={
              <a
                href={landingScheduleHref()}
                className="inline-flex h-10 items-center rounded-full border border-[var(--balanse-tan)] px-5 text-sm font-semibold transition-colors hover:border-accent hover:bg-secondary/60"
              >
                Filter the calendar
              </a>
            }
          />
          <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <MarketingImage assetId="landing-b" className="order-last md:order-first" />
            <ul className="flex flex-wrap gap-2 self-start">
              {ABOUT_CLASS_FAMILIES.map((name) => (
                <li
                  key={name}
                  className="rounded-full border border-[var(--balanse-tan)]/60 bg-secondary/60 px-3.5 py-1.5 text-sm font-medium"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="coaches" data-section="coaches" className="mt-16 scroll-mt-24 md:mt-20">
          <SectionHeading
            eyebrow="Your coaches"
            title="Coaches"
            description="Every coach teaches published sessions on the calendar above."
            action={
              <Link
                href="/coaches"
                className="inline-flex h-10 items-center rounded-full border border-[var(--balanse-tan)] px-5 text-sm font-semibold transition-colors hover:border-accent hover:bg-secondary/60"
              >
                Meet the team
              </Link>
            }
          />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
              <li key={coach.id}>
                <CoachPreviewCard coach={coach} />
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16 grid gap-6 md:mt-20 md:grid-cols-2">
          <section
            data-section="about"
            className="rounded-2xl border border-[var(--balanse-tan)]/50 bg-card p-6 md:p-8"
          >
            <SectionHeading
              eyebrow="The studio"
              title="About Balansé"
              description="We promote holistic wellness by combining movement, fitness education, recovery, and tranquility. Join us for workshops, classes, and community support."
            />
            <Link
              href="/about"
              className="mt-6 inline-flex h-10 items-center rounded-full border border-[var(--balanse-tan)] px-5 text-sm font-semibold transition-colors hover:border-accent hover:bg-secondary/60"
            >
              More about the studio
            </Link>
          </section>

          <section
            data-section="location"
            className="rounded-2xl border border-[var(--balanse-tan)]/50 bg-card p-6 md:p-8"
          >
            <SectionHeading
              eyebrow="Find us"
              title="Location / walking in"
              description="Walking in is the same booking path: scan the Balansé QR, sign in or create an account, then reserve on this calendar. There is no separate walk-in desk."
            />
            <p className="mt-6 text-sm font-medium">{CONTACT_DETAILS.address}</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex h-10 items-center rounded-full border border-[var(--balanse-tan)] px-5 text-sm font-semibold transition-colors hover:border-accent hover:bg-secondary/60"
            >
              Directions and contact
            </Link>
          </section>
        </div>
      </div>

      <BalanseCtaSection
        blockId="landing-final"
        sectionName="final-cta"
        assetIds={["landing-d", "landing-b", "landing-c"]}
        features={[
          { icon: "sparkles", label: "Guests browse the calendar free" },
          { icon: "users", label: "Small groups, familiar coaches" },
          { icon: "workflow", label: "GCash or Pay at Counter" },
          { icon: "shield", label: "An admin confirms every booking" },
        ]}
        className="mt-16 md:mt-20"
      />
    </div>
  );
}
