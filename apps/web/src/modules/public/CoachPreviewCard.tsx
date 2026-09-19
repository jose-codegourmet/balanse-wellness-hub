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
      className="group"
      data-coach-id={coach.id}
      data-has-photo={card.photoKey ? "true" : "false"}
    >
      <CoachPhoto photoKey={card.photoKey} name={card.name} ratio="4:5" className="!rounded-sm" />
      <h3 className="mt-5 font-display text-2xl font-normal">{card.name}</h3>
      <p className="text-sm text-muted-foreground">{card.specialties.join(" · ")}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.shortBio}</p>
      {showViewClasses ? (
        <Link href={coachViewClassesHref(coach.id)} className="marketing-text-link mt-4">
          View Classes
        </Link>
      ) : null}
    </article>
  );
}
