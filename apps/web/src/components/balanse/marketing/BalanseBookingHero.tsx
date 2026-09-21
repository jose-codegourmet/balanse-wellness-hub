"use client";

import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
import { ScrollReveal } from "@balanse/ui";
import { ArrowUpRight, CalendarDays, MapPin, MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";
import "./booking-hero.css";

export function BalanseBookingHero({
  sessions,
  classes,
  coaches,
  loadError,
  coachId,
  classId,
}: {
  sessions: PublicSession[];
  classes: PublicClass[];
  coaches: PublicCoach[];
  loadError: boolean;
  coachId: string;
  classId: string;
}) {
  const [mode, setMode] = useState<"quick" | "calendar">(
    coachId !== "all" || classId !== "all" ? "calendar" : "quick",
  );
  return (
    <section className="guided-hero-scene" aria-labelledby="home-hero-title">
      <div className="guided-hero-background" aria-hidden="true">
        <Image
          src="/assets/marketing/landing/booking-hero-background-2k.webp"
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="guided-hero marketing-container" data-mode={mode}>
        <ScrollReveal>
          <div className="guided-hero-copy" data-section="hero-copy">
            <p className="marketing-eyebrow">Movement. Wellness. Community.</p>
            <h1 id="home-hero-title">
              A little movement.
              <br />
              <em>A little more you.</em>
            </h1>
            <p className="guided-hero-description">
              Make space for strength, stillness, and everything in between. Your next practice
              begins here.
            </p>
            <div className="guided-hero-location">
              <MapPin size={15} strokeWidth={1.5} aria-hidden="true" /> Your wellness space in Cebu
              City
            </div>
            <div className="guided-hero-footnote">
              <span>
                Find your practice.
                <br />
                We’ll meet you there.
              </span>
              <Link href="/coaches">
                Meet the coaches <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
        <section
          id="schedule"
          data-section="calendar-hero"
          className="guided-booking-panel"
          aria-labelledby="schedule-title"
        >
          <div className="guided-booking-heading">
            <div>
              <p className="marketing-eyebrow">Your time, well spent</p>
              <h2 id="schedule-title">Find your next class</h2>
            </div>
            <span className="guided-booking-symbol" aria-hidden="true">
              <CalendarDays size={23} strokeWidth={1.25} />
            </span>
          </div>
          <fieldset className="guided-booking-modes" aria-label="Choose how to find a class">
            <button type="button" aria-pressed={mode === "quick"} onClick={() => setMode("quick")}>
              <MoveRight size={16} aria-hidden="true" /> Quick booking
            </button>
            <button
              type="button"
              aria-pressed={mode === "calendar"}
              onClick={() => setMode("calendar")}
            >
              <CalendarDays size={16} aria-hidden="true" /> Pick from calendar
            </button>
          </fieldset>
          <ScheduleCalendarSection
            audience="guest"
            presentation={mode}
            initialSessions={sessions}
            initialClasses={classes}
            initialCoaches={coaches}
            initialLoadError={loadError}
            initialCoachFilter={coachId}
            initialClassFilter={classId}
          />
          <p className="guided-booking-note">
            Philippine time · Explore freely. Sign in when you’re ready to book.
          </p>
        </section>
      </div>
    </section>
  );
}
