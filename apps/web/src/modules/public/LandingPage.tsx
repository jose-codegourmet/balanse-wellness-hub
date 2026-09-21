import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
import { ABOUT_CLASS_FAMILIES, CONTACT_DETAILS } from "@balanse/domain";
import { MarketingImage, ScrollReveal } from "@balanse/ui";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { BalanseBookingHero } from "@/components/balanse/marketing/BalanseBookingHero";
import { BalanseCtaSection } from "@/components/balanse/marketing/BalanseCtaSection";
import { Button } from "@/components/jabkit/button";
import { CoachPreviewCard } from "./CoachPreviewCard";

const STEPS = [
  { title: "Find your class", body: "Choose a day, a discipline, and a time that works for you." },
  { title: "Reserve your space", body: "Sign in to reserve a spot or join the waitlist." },
  { title: "Make your payment", body: "Pay with GCash or at the counter." },
  { title: "You're on your way", body: "Check your booking for the studio's confirmation." },
];

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
    <div className="marketing-home">
      <BalanseBookingHero
        key={`${coachId}-${classId}`}
        sessions={sessions}
        classes={classes}
        coaches={coaches}
        loadError={loadError}
        coachId={coachId}
        classId={classId}
      />
      <div className="marketing-container">
        <section data-section="how-it-works" className="marketing-section">
          <ScrollReveal>
            <div className="max-w-xl">
              <h2 className="marketing-title">A little time. All for you.</h2>
              <p className="marketing-copy">
                From your first class to your weekly ritual, getting started is simple.
              </p>
            </div>
          </ScrollReveal>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <ScrollReveal delay={index * 0.06}>
                  <div className="border-t border-border pt-5">
                    <span className="font-display text-2xl text-muted-foreground">
                      0{index + 1}
                    </span>
                    <h3 className="mt-5 text-sm font-semibold">{step.title}</h3>
                    <p className="mt-2 max-w-60 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="classes"
          data-section="classes"
          className="marketing-section scroll-mt-24 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20"
        >
          <ScrollReveal>
            <MarketingImage assetId="landing-b" className="!rounded-sm" />
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div>
              <p className="marketing-eyebrow">Find your practice</p>
              <h2 className="marketing-title mt-4">
                Room to move.
                <br />
                Space to grow.
              </h2>
              <p className="marketing-copy">
                Stretch, strengthen, or try something new. Discover a practice that feels right for
                you.
              </p>
              <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-0">
                {ABOUT_CLASS_FAMILIES.map((name) => {
                  const discipline = classes.find((item) => item.name === name);
                  return (
                    <li key={name}>
                      <Link
                        href={
                          discipline
                            ? `/classes/${encodeURIComponent(discipline.slug)}`
                            : "/#schedule"
                        }
                        className="group flex min-h-12 items-center justify-between gap-2 border-b border-border/70 py-3 text-sm transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {name}
                        <ArrowUpRight
                          className="size-3.5 shrink-0 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </ScrollReveal>
        </section>

        <section id="coaches" data-section="coaches" className="marketing-section scroll-mt-24">
          <ScrollReveal>
            <h2 className="marketing-title">Good people. Thoughtful guidance.</h2>
            <p className="marketing-copy max-w-xl">
              Meet the people who bring care, experience, and their own love of movement to every
              class.
            </p>
          </ScrollReveal>
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {coaches.slice(0, 3).map((coach, index) => (
              <li key={coach.id}>
                <ScrollReveal delay={index * 0.08}>
                  <CoachPreviewCard coach={coach} showViewClasses />
                </ScrollReveal>
              </li>
            ))}
          </ul>
          <ScrollReveal delay={0.16}>
            <Link href="/coaches" className="marketing-text-link mt-8">
              Meet all our coaches <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </section>

        <section
          data-section="about"
          className="marketing-section grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20"
        >
          <ScrollReveal>
            <div>
              <p className="marketing-eyebrow">The Balansé way</p>
              <h2 className="marketing-title mt-4">
                More than movement.
                <br />A sense of belonging.
              </h2>
              <p className="marketing-copy">
                Movement, fitness education, recovery, and tranquility. A dedicated space in Cebu to
                find your rhythm, with a community beside you.
              </p>
              <Link href="/about" className="marketing-text-link mt-7">
                Get to know Balansé <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <MarketingImage assetId="about-b" className="!rounded-sm" />
          </ScrollReveal>
        </section>

        <section
          data-section="location"
          className="marketing-section grid gap-8 border-y border-border py-10 md:grid-cols-[1fr_1fr] md:gap-20 md:py-14"
        >
          <ScrollReveal>
            <div>
              <MapPin
                className="mb-4 size-5 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h2 className="font-display text-3xl font-normal">Your space in the city.</h2>
              <p className="marketing-copy max-w-sm">{CONTACT_DETAILS.address}</p>
              <a
                href={CONTACT_DETAILS.mapHref}
                target="_blank"
                rel="noreferrer"
                className="marketing-text-link mt-5"
              >
                Find the studio <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <div className="md:pt-9">
              <h3 className="text-base font-semibold">Dropping by?</h3>
              <p className="marketing-copy max-w-md">
                Scan the Balansé QR at the studio, sign in, and choose your class on the calendar.
                The same simple booking, wherever you begin.
              </p>
              <Button
                asChild
                variant="secondary"
                className="mt-6 rounded-full border-border bg-transparent px-5 hover:bg-secondary"
              >
                <a href="#schedule">
                  See the schedule <ArrowDown className="ml-3 size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </ScrollReveal>
        </section>
      </div>
      <BalanseCtaSection
        blockId="landing-final"
        sectionName="final-cta"
        assetIds={["landing-d"]}
        className="marketing-section"
      />
    </div>
  );
}
