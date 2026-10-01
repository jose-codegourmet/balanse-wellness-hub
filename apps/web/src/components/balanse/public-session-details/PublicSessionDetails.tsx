import {
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  sessionAvailabilityLabel,
} from "@balanse/domain";
import { CoachPhoto } from "@balanse/ui";
import { CalendarDays, Clock3, MapPin, Ticket, Users } from "lucide-react";
import Link from "next/link";
import type { PublicSessionDetailsProps } from "./PublicSessionDetails.meta";

function durationLabel(startsAt: string, endsAt: string): string {
  const minutes = Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

/** Facts + coaches + class blurb shared by the public session and event pages. */
export function PublicSessionDetails({
  session,
  showClassBlurb = true,
}: PublicSessionDetailsProps) {
  const spots =
    session.availability === "cancelled" || session.availability === "past"
      ? null
      : session.remainingSlots > 0
        ? `${session.remainingSlots} of ${session.capacity} spots left`
        : `Full · ${session.capacity} spots`;
  const facts = [
    {
      icon: CalendarDays,
      label: "Date",
      value: formatSessionDate(session.startsAt),
    },
    {
      icon: Clock3,
      label: "Time",
      value: `${formatSessionTimeRange(session.startsAt, session.endsAt)} · ${durationLabel(
        session.startsAt,
        session.endsAt,
      )}`,
    },
    session.venue
      ? {
          icon: MapPin,
          label: "Where",
          value: session.venue.name,
          detail: session.venue.address || undefined,
        }
      : null,
    { icon: Ticket, label: "Price", value: `${formatPeso(session.pricePhp)} per person` },
    spots
      ? {
          icon: Users,
          label: "Spots",
          value: spots,
          detail: sessionAvailabilityLabel(session.availability),
        }
      : null,
  ].filter((fact): fact is NonNullable<typeof fact> => fact !== null);

  return (
    <div className="flex flex-col gap-10">
      <dl className="grid gap-4 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <fact.icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="mt-1 font-medium">{fact.value}</dd>
              {"detail" in fact && fact.detail ? (
                <dd className="text-sm text-muted-foreground">{fact.detail}</dd>
              ) : null}
            </div>
          </div>
        ))}
      </dl>

      <section aria-labelledby="public-session-coaches">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Teaching
        </p>
        <h2 id="public-session-coaches" className="mt-1 font-display text-2xl">
          {session.coachesDetailed.length === 1 ? "Your coach" : "Your coaches"}
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {session.coachesDetailed.map((coach) => (
            <li key={coach.id}>
              <Link
                href="/coaches"
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary/60"
              >
                <CoachPhoto
                  photoKey={coach.photoKey}
                  name={coach.name}
                  className="size-16 shrink-0 overflow-hidden rounded-full"
                />
                <span className="min-w-0">
                  <span className="block font-medium">{coach.name}</span>
                  {coach.specialties.length ? (
                    <span className="block truncate text-sm text-muted-foreground">
                      {coach.specialties.join(" · ")}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {showClassBlurb && session.classShortDescription ? (
        <section aria-labelledby="public-session-class" className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            The class
          </p>
          <h2 id="public-session-class" className="mt-1 font-display text-2xl">
            {session.className}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {session.classShortDescription}
          </p>
          <Link
            href={`/classes/${encodeURIComponent(session.classSlug)}`}
            className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
          >
            More about {session.className}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
