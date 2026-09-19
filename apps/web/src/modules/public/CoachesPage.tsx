"use client";

import type { PublicCoach } from "@balanse/domain";
import {
  COACH_SPECIALTY_ACCENT_IDS,
  coachSpecialtyChips,
  filterPublicCoaches,
  publicCoachCardFields,
} from "@balanse/domain";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  MarketingImage,
  SectionHeading,
} from "@balanse/ui";
import { useMemo, useState } from "react";
import { BalanseCtaSection } from "@/components/balanse/marketing/BalanseCtaSection";
import { BalanseHero } from "@/components/balanse/marketing/BalanseHero";
import { CoachPreviewCard } from "./CoachPreviewCard";

const SPECIALTY_ACCENT_LABELS: Record<(typeof COACH_SPECIALTY_ACCENT_IDS)[number], string> = {
  "coaches-c-yoga": "Yoga",
  "coaches-c-boxing": "Kickboxing",
  "coaches-c-capoeira": "Capoeira",
  "coaches-c-calisthenics": "Calisthenics",
  "coaches-c-pilates": "Mat Pilates",
  "coaches-c-dance": "Dance Fitness",
};

export function CoachesPage({
  coaches,
  initialSpecialty = "All",
}: {
  coaches: PublicCoach[];
  initialSpecialty?: string;
}) {
  const chips = coachSpecialtyChips(coaches);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const visible = useMemo(() => filterPublicCoaches(coaches, specialty), [coaches, specialty]);

  return (
    <article>
      <BalanseHero
        assetId="coaches-c-capoeira"
        eyebrow="The roster"
        titleLines={["Meet the coaches."]}
        primaryAction={{ label: "View the schedule", href: "/#schedule" }}
        secondaryAction={{ label: "About the studio", href: "/about" }}
        align="compact"
        features={[
          {
            icon: "monitor",
            title: "View Classes opens the calendar",
            description: "Each card filters the public week\nfor that coach.",
          },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        <SectionHeading
          eyebrow="Specialties"
          title="Filter by what you want to train"
          description="Rates are not shown on public pages. Pick a specialty, then open the calendar for that coach."
        />

        <ul className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6" aria-label="Specialty accents">
          {COACH_SPECIALTY_ACCENT_IDS.map((assetId) => (
            <li key={assetId}>
              <MarketingImage assetId={assetId} className="rounded-2xl" />
              <p className="mt-2 text-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {SPECIALTY_ACCENT_LABELS[assetId]}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-2" role="toolbar" aria-label="Specialty filters">
          {chips.map((chip) => {
            const active = specialty === chip;
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={active}
                onClick={() => setSpecialty(chip)}
                className={
                  active
                    ? "inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    : "inline-flex h-9 items-center rounded-full border border-[var(--balanse-tan)] bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                }
              >
                {chip}
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <div className="mt-10">
            <Empty className="border border-dashed border-border bg-card">
              <EmptyHeader>
                <EmptyTitle>No coaches match this filter</EmptyTitle>
                <EmptyDescription>
                  Choose All or another specialty to see the roster.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((coach) => {
              const card = publicCoachCardFields(coach);
              return (
                <li key={coach.id}>
                  <CoachPreviewCard coach={{ ...coach, ...card }} showViewClasses />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <BalanseCtaSection
        blockId="coaches-final"
        assetIds={[...COACH_SPECIALTY_ACCENT_IDS]}
        features={[
          { icon: "users", label: "Yoga, boxing, capoeira, and more" },
          { icon: "sparkles", label: "Small groups, familiar faces" },
          { icon: "gauge", label: "Filter the week by coach" },
          { icon: "workflow", label: "Reserve, pay, get confirmed" },
        ]}
        className="mt-16 md:mt-20"
      />
    </article>
  );
}
