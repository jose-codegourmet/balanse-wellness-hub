"use client";

import { publicBookingHref } from "@balanse/domain";
import { Chip, chipVariants, ScrollReveal } from "@balanse/ui";
import { ArrowUpRight, CalendarDays, MapPin, MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ScheduleCalendarSection } from "@/modules/schedule/ScheduleCalendarSection";
import type { BalanseBookingHeroProps } from "./BalanseBookingHero.meta";
import "../booking-hero.css";

export function BalanseBookingHero({
  sessions,
  classes,
  coaches,
  loadError,
  coachId,
  classId,
  bookingMode,
}: BalanseBookingHeroProps) {
  const [homeMode, setMode] = useState<"quick" | "calendar">(
    coachId !== "all" || classId !== "all" ? "calendar" : "quick",
  );
  const mode = bookingMode ?? homeMode;
  const filters = {
    coachId: coachId === "all" ? undefined : coachId,
    classId: classId === "all" ? undefined : classId,
  };

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
            <p className="marketing-eyebrow">
              {bookingMode ? "Make time for yourself" : "Movement. Wellness. Community."}
            </p>
            <h1 id="home-hero-title">
              {bookingMode ? (
                <>
                  Find your next class.
                  <br />
                  <em>{mode === "quick" ? "One step at a time." : "On your time."}</em>
                </>
              ) : (
                <>
                  A little movement.
                  <br />
                  <em>A little more you.</em>
                </>
              )}
            </h1>
            <p className="guided-hero-description">
              {bookingMode === "quick"
                ? "Choose a practice, find a time, and review your class. We’ll guide you through it."
                : bookingMode === "calendar"
                  ? "Explore the studio schedule by day, week, or month. Choose a class to see the details and reserve your space."
                  : "Make space for strength, stillness, and everything in between. Your next practice begins here."}
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
              <h2 id="schedule-title">
                {bookingMode === "quick"
                  ? "Quick booking"
                  : bookingMode === "calendar"
                    ? "Class calendar"
                    : "Find your next class"}
              </h2>
            </div>
            <span className="guided-booking-symbol" aria-hidden="true">
              <CalendarDays size={23} strokeWidth={1.25} />
            </span>
          </div>
          {bookingMode ? (
            <nav className="guided-booking-modes" aria-label="Choose how to find a class">
              <Link
                href={publicBookingHref("quick", filters)}
                aria-current={mode === "quick" ? "page" : undefined}
                data-slot="chip"
                className={chipVariants({ selected: mode === "quick" })}
              >
                <MoveRight size={16} aria-hidden="true" /> Quick booking
              </Link>
              <Link
                href={publicBookingHref("calendar", filters)}
                aria-current={mode === "calendar" ? "page" : undefined}
                data-slot="chip"
                className={chipVariants({ selected: mode === "calendar" })}
              >
                <CalendarDays size={16} aria-hidden="true" /> Pick from calendar
              </Link>
            </nav>
          ) : (
            <fieldset className="guided-booking-modes" aria-label="Choose how to find a class">
              <Chip selected={mode === "quick"} onClick={() => setMode("quick")}>
                <MoveRight size={16} aria-hidden="true" /> Quick booking
              </Chip>
              <Chip selected={mode === "calendar"} onClick={() => setMode("calendar")}>
                <CalendarDays size={16} aria-hidden="true" /> Pick from calendar
              </Chip>
            </fieldset>
          )}
          <ScheduleCalendarSection
            key={`${mode}-${coachId}-${classId}`}
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
