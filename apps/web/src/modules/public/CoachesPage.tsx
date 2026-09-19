"use client";

import type { PublicCoach } from "@balanse/domain";
import { coachSpecialtyChips, filterPublicCoaches, publicCoachCardFields } from "@balanse/domain";
import { Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@balanse/ui";
import { useMemo, useState } from "react";
import { CoachPreviewCard } from "./CoachPreviewCard";

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
    <article className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Meet the Coaches</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Filter by specialty. View Classes opens the public calendar for that coach. Rates are not
        shown.
      </p>
      <div className="mt-6 flex flex-wrap gap-2" role="toolbar" aria-label="Specialty filters">
        {chips.map((chip) => (
          <Button
            key={chip}
            type="button"
            size="sm"
            variant={specialty === chip ? "default" : "outline"}
            onClick={() => setSpecialty(chip)}
          >
            {chip}
          </Button>
        ))}
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
    </article>
  );
}
