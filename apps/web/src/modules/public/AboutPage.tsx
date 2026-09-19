import type { PublicCoach } from "@balanse/domain";
import { ABOUT_APPROACH_PILLARS, ABOUT_CLASS_FAMILIES, BOOKING_STEPS } from "@balanse/domain";
import { MarketingImage, SectionHeading } from "@balanse/ui";
import { BalanseCtaSection } from "@/components/balanse/marketing/BalanseCtaSection";
import { BalanseHero } from "@/components/balanse/marketing/BalanseHero";
import { CoachPreviewCard } from "./CoachPreviewCard";

const PILLAR_COPY: Record<(typeof ABOUT_APPROACH_PILLARS)[number], string> = {
  Movement: "Strength, mobility, and skill work you can repeat every week.",
  Wellness: "Recovery and tranquility sit beside the training, not after it.",
  Community: "Small groups, familiar coaches, and room to come back at your pace.",
};

export function AboutPage({ coaches }: { coaches: PublicCoach[] }) {
  return (
    <article>
      <div data-about-block="about">
        <BalanseHero
          assetId="about-a"
          eyebrow="About the studio"
          titleLines={["Movement, wellness,", "and community."]}
          primaryAction={{ label: "Meet the coaches", href: "/coaches" }}
          secondaryAction={{ label: "View the schedule", href: "/#schedule" }}
          features={[
            {
              icon: "armchair",
              title: "A dedicated space",
              description: "Movement, fitness education,\nrecovery, and tranquility.",
            },
            {
              icon: "monitor",
              title: "One booking path",
              description: "Workshops and classes all run\nthrough the public calendar.",
            },
          ]}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        <p className="max-w-3xl text-pretty text-muted-foreground md:text-lg">
          At Balansé, we promote holistic wellness by combining movement, fitness education,
          recovery, and tranquility. Join us for workshops, classes, and community support. Our
          dedicated space supports your journey to a healthier and more balanced lifestyle.
        </p>

        <section data-about-block="approach" className="mt-14 md:mt-20">
          <SectionHeading eyebrow="How we train" title="Our Approach" />
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_18rem] md:items-start">
            <ul className="grid gap-4 sm:grid-cols-3">
              {ABOUT_APPROACH_PILLARS.map((pillar) => (
                <li
                  key={pillar}
                  className="rounded-xl border border-[var(--balanse-tan)]/50 bg-card p-5 transition-colors hover:border-accent"
                >
                  <p className="font-display text-xl">{pillar}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{PILLAR_COPY[pillar]}</p>
                </li>
              ))}
            </ul>
            <MarketingImage assetId="about-b" />
          </div>
        </section>

        <MarketingImage assetId="about-c" className="mt-14" decorative />

        <section data-about-block="what-you-can-do" className="mt-14 md:mt-20">
          <SectionHeading
            eyebrow="Class families"
            title="What You Can Do"
            description="Every family below runs on the public calendar. Filter the week and reserve the session that fits."
          />
          <ul className="mt-8 flex flex-wrap gap-2">
            {ABOUT_CLASS_FAMILIES.map((name) => (
              <li
                key={name}
                className="rounded-full border border-[var(--balanse-tan)]/60 bg-secondary/60 px-3.5 py-1.5 text-sm font-medium"
              >
                {name}
              </li>
            ))}
          </ul>
        </section>

        <section data-about-block="meet-the-team" className="mt-14 md:mt-20">
          <SectionHeading
            eyebrow="The roster"
            title="Meet the Team"
            description="Photos come from each coach record. Longer bios are not published."
          />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
              <li key={coach.id}>
                <CoachPreviewCard coach={coach} />
              </li>
            ))}
          </ul>
        </section>

        <section data-about-block="how-booking-works" className="mt-14 md:mt-20">
          <SectionHeading
            eyebrow="Four steps"
            title="How Booking Works"
            description="After you pay (GCash or Pay at Counter), an admin confirms the reservation."
          />
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BOOKING_STEPS.map((step, index) => (
              <li
                key={step}
                className="rounded-xl border border-[var(--balanse-tan)]/50 bg-card p-5 transition-colors hover:border-accent"
              >
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-secondary font-display text-sm">
                  {index + 1}
                </span>
                <p className="mt-3 font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div data-about-block="view-schedule">
        <BalanseCtaSection
          blockId="about-final"
          assetIds={["about-b", "about-a", "about-c"]}
          features={[
            { icon: "sparkles", label: "Movement, wellness, community" },
            { icon: "users", label: "Coaches you will see every week" },
            { icon: "workflow", label: "Reserve, pay, get confirmed" },
            { icon: "gauge", label: "No phone tag, no walk-in desk" },
          ]}
          className="mt-16 md:mt-20"
        />
      </div>
    </article>
  );
}
