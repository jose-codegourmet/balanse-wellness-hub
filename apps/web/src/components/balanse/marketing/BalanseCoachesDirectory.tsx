"use client";

import {
  coachSpecialtyChips,
  coachViewClassesHref,
  filterPublicCoaches,
  type PublicCoach,
  resolveCoachPhotoSources,
} from "@balanse/domain";
import { CoachPhoto, MarketingImage } from "@balanse/ui";
import { ArrowUpRight, CircleArrowDown, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/jabkit/button";
import { BalanseCtaSection } from "./BalanseCtaSection";
import "./coaches-directory.css";

/** The one place the group hero points at, so ASSET-015's replacement is a single edit. */
const HERO_ASSET_ID = "coaches-b";

function Portrait({ coach }: { coach: PublicCoach }) {
  const hasPhoto = !resolveCoachPhotoSources(coach.photoKey).isPlaceholder;
  return hasPhoto ? (
    <CoachPhoto
      photoKey={coach.photoKey}
      name={coach.name}
      ratio="4:5"
      className="coaches-portrait"
    />
  ) : (
    <div
      className="coaches-monogram"
      role="img"
      aria-label={`Portrait coming soon for ${coach.name}`}
    >
      <span aria-hidden="true">
        {coach.name
          .split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join("")}
      </span>
      <small>Balansé coach</small>
    </div>
  );
}

export function BalanseCoachesDirectory({
  coaches,
  initialSpecialty = "All",
}: {
  coaches: PublicCoach[];
  initialSpecialty?: string;
}) {
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const chips = coachSpecialtyChips(coaches);
  const visible = useMemo(() => filterPublicCoaches(coaches, specialty), [coaches, specialty]);

  return (
    <article className="coaches-directory">
      <header className="coaches-intro marketing-container">
        <div className="coaches-intro-headline">
          <div>
            <p className="marketing-eyebrow">The people behind your practice</p>
            <h1>
              Good movement. <em>Great company.</em>
            </h1>
          </div>
          <Button asChild size="sm" className="coaches-intro-cta">
            <a href="#coaching-team">
              <CircleArrowDown size={16} strokeWidth={1.5} aria-hidden="true" />
              Meet your coaches
            </a>
          </Button>
        </div>
        <div className="coaches-intro-columns">
          <p>
            Meet the coaches who bring Balansé to life. Some arrived from competitive sport, some
            from years of teaching, some from their own recovery. What they share is a way of
            running a room where the person at the back is looked after as carefully as the person
            at the front.
          </p>
          <p>
            Every coach here teaches sessions you can book this week. Filter the roster by the
            practice you already know, or start with one you have never tried — each card links
            straight to that coach&apos;s published classes.
          </p>
        </div>
        <figure className="coaches-hero-group">
          <MarketingImage
            assetId={HERO_ASSET_ID}
            loading="eager"
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 100vw, 1216px"
            className="coaches-hero-group-media"
            frameLabel="The coaching team"
            frameCaption="Group portrait coming soon."
          />
          <figcaption>Different disciplines. A shared love of movement.</figcaption>
        </figure>
      </header>

      <section
        id="coaching-team"
        className="coaches-roster marketing-container"
        aria-labelledby="coaches-team-title"
      >
        <div className="coaches-roster-heading">
          <div>
            <p className="marketing-eyebrow">Find your connection</p>
            <h2 id="coaches-team-title">Our coaching team</h2>
          </div>
          <p>
            Coaches you will see every week, not a rotating cast. Start with a familiar practice or
            let someone introduce you to a new one — every name below is teaching on the public
            calendar.
          </p>
        </div>
        <div className="coaches-filter-section">
          <span className="coaches-filter-label">
            <SlidersHorizontal size={15} strokeWidth={1.5} aria-hidden="true" /> Explore by class
          </span>
          <fieldset className="coaches-filters" aria-label="Specialty filters">
            {chips.map((chip) => (
              <button
                type="button"
                key={chip}
                aria-pressed={specialty === chip}
                onClick={() => setSpecialty(chip)}
              >
                {chip === "All" ? "All coaches" : chip}
              </button>
            ))}
          </fieldset>
        </div>
        <p className="coaches-results" role="status">
          {visible.length} {visible.length === 1 ? "coach" : "coaches"}
          {specialty !== "All" ? ` · ${specialty}` : " · One welcoming studio"}
        </p>
        {visible.length ? (
          <ul className="coaches-roster-grid">
            {visible.map((coach) => (
              <li key={coach.id}>
                <article
                  className="coaches-person"
                  data-coach-id={coach.id}
                  data-has-photo={coach.photoKey ? "true" : "false"}
                >
                  <Link
                    href={coachViewClassesHref(coach.id)}
                    className="coaches-photo-link"
                    aria-label={`View classes with ${coach.name}`}
                  >
                    <Portrait coach={coach} />
                    <span className="coaches-photo-action" aria-hidden="true">
                      <ArrowUpRight size={20} strokeWidth={1.5} />
                    </span>
                  </Link>
                  <div className="coaches-person-details">
                    <h3>{coach.name}</h3>
                    <p className="coaches-person-specialties">{coach.specialties.join(" · ")}</p>
                    <p className="coaches-person-bio">{coach.shortBio}</p>
                    <Link href={coachViewClassesHref(coach.id)} className="coaches-class-link">
                      View classes <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="coaches-empty">
            <h3>No coaches for this class yet.</h3>
            <p>Explore the full team to find your next practice.</p>
            <Button variant="secondary" onClick={() => setSpecialty("All")}>
              See all coaches
            </Button>
          </div>
        )}
      </section>
      {/* The closing invitation now runs through the same composition as every
          other public page, so `/coaches` stops being the one page with a
          hand-rolled CTA. The photo slot is optional: ASSET-015 can attach an
          asset to the `coaches-close` block later with no change here. */}
      <BalanseCtaSection
        blockId="coaches-close"
        sectionName="coaches-invitation"
        className="coaches-closing-cta"
        features={[
          { icon: "users", label: "Every coach teaches published sessions" },
          { icon: "sparkles", label: "Filter the week by coach or class" },
          { icon: "workflow", label: "Reserve, pay, get confirmed" },
          { icon: "shield", label: "Guests can browse before signing up" },
        ]}
      />
    </article>
  );
}
