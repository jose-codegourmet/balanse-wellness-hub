import type { PublicCoach } from "@balanse/domain";
import {
  ABOUT_APPROACH_PILLARS,
  ABOUT_CLASS_FAMILIES,
  BOOKING_STEPS,
  landingScheduleHref,
} from "@balanse/domain";
import { MarketingImage } from "@balanse/ui";
import Link from "next/link";
import { CoachPreviewCard } from "./CoachPreviewCard";

export function AboutPage({ coaches }: { coaches: PublicCoach[] }) {
  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <section data-about-block="about" className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="font-display text-3xl">About Balansé</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            At Balansé, we promote holistic wellness by combining movement, fitness education,
            recovery, and tranquility. Join us for workshops, classes, and community support. Our
            dedicated space supports your journey to a healthier and more balanced lifestyle.
          </p>
        </div>
        <MarketingImage assetId="about-a" />
      </section>

      <section data-about-block="approach" className="mt-14 grid gap-6 md:grid-cols-[1fr_16rem]">
        <div>
          <h2 className="font-display text-2xl">Our Approach</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {ABOUT_APPROACH_PILLARS.map((pillar) => (
              <li key={pillar} className="rounded-xl border border-border bg-card p-4">
                <p className="font-medium">{pillar}</p>
              </li>
            ))}
          </ul>
        </div>
        <MarketingImage assetId="about-b" />
      </section>

      <MarketingImage assetId="about-c" className="mt-10" decorative />

      <section data-about-block="what-you-can-do" className="mt-14">
        <h2 className="font-display text-2xl">What You Can Do</h2>
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
      </section>

      <section data-about-block="meet-the-team" className="mt-14">
        <h2 className="font-display text-2xl">Meet the Team</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Photos come from each coach record. Individual bios are not published.
        </p>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <li key={coach.id}>
              <CoachPreviewCard coach={coach} />
            </li>
          ))}
        </ul>
      </section>

      <section data-about-block="how-booking-works" className="mt-14">
        <h2 className="font-display text-2xl">How Booking Works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4">
          {BOOKING_STEPS.map((step, index) => (
            <li key={step} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{index + 1}</p>
              <p className="mt-1 font-medium">{step}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          After you pay (GCash or Pay at Counter), an admin confirms the reservation.
        </p>
      </section>

      <div data-about-block="view-schedule" className="mt-10">
        <Link
          href={landingScheduleHref()}
          className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          View Schedule
        </Link>
      </div>
    </article>
  );
}
