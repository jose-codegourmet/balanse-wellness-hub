"use client";

import { Badge, type ChoiceOption, CoachPhoto, cn } from "@balanse/ui";
import type { CoachOptionCoach, CoachOptionProps } from "./CoachOption.meta";

export type { CoachOptionCoach, CoachOptionLayout, CoachOptionProps } from "./CoachOption.meta";

export function coachSpecialtyLine(coach: CoachOptionCoach): string | undefined {
  const specialties = (coach.specialties ?? []).slice(0, 3);
  const parts = [...specialties];
  if (coach.active === false) parts.push("Inactive");
  return parts.length ? parts.join(" · ") : undefined;
}

export function toCoachChoiceOption(coach: CoachOptionCoach): ChoiceOption {
  return {
    value: coach.id,
    label: coach.name,
    description: coachSpecialtyLine(coach),
    leading: <CoachOption coach={coach} />,
  };
}

export function CoachOption({ coach, layout = "avatar", className }: CoachOptionProps) {
  const inactive = coach.active === false;
  const avatar = (
    <span
      aria-hidden="true"
      data-slot="coach-option-avatar"
      className={cn(
        "relative flex size-7 shrink-0 overflow-hidden rounded-full bg-muted",
        inactive && "opacity-60",
      )}
    >
      <CoachPhoto
        photoKey={coach.photoKey}
        name={coach.name}
        ratio="1:1"
        className="size-7 rounded-full"
      />
    </span>
  );

  if (layout === "avatar") {
    return (
      <span
        data-slot="coach-option"
        aria-hidden="true"
        className={cn("flex items-center gap-1.5", className)}
      >
        {avatar}
        {inactive ? (
          <Badge variant="neutral" appearance="soft" size="sm">
            Inactive
          </Badge>
        ) : null}
      </span>
    );
  }

  return (
    <span data-slot="coach-option" className={cn("flex min-w-0 items-center gap-2", className)}>
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm leading-5">{coach.name}</span>
        {coachSpecialtyLine(coach) ? (
          <span className="block truncate text-xs leading-4 text-muted-foreground">
            {coachSpecialtyLine(coach)}
          </span>
        ) : null}
      </span>
      {inactive ? (
        <Badge variant="neutral" appearance="soft" size="sm">
          Inactive
        </Badge>
      ) : null}
    </span>
  );
}
