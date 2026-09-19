import type { PublicCoach } from "@balanse/domain";
import { coachViewClassesHref, publicCoachCardFields } from "@balanse/domain";
import { CoachPhoto } from "@balanse/ui";
import Link from "next/link";

export function CoachPreviewCard({
  coach,
  showViewClasses = false,
}: {
  coach: PublicCoach;
  showViewClasses?: boolean;
}) {
  const card = publicCoachCardFields(coach);
  return (
    <article
      className="rounded-xl border border-border bg-card p-4"
      data-coach-id={coach.id}
      data-has-photo={card.photoKey ? "true" : "false"}
    >
      <CoachPhoto photoKey={card.photoKey} name={card.name} ratio="4:5" />
      <h3 className="mt-3 font-display text-xl">{card.name}</h3>
      <p className="text-sm text-muted-foreground">{card.specialties.join(" · ")}</p>
      <p className="mt-2 text-sm">{card.shortBio}</p>
      {showViewClasses ? (
        <Link
          href={coachViewClassesHref(coach.id)}
          className="mt-4 inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          View Classes
        </Link>
      ) : null}
    </article>
  );
}
