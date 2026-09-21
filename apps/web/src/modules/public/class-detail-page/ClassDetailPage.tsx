"use client";
import { parseClassPreview, sessionDisplayName } from "@balanse/domain";
import { CoachPhoto, renderMarkdownSubset } from "@balanse/ui";
import { ArrowDown, ArrowLeft, ArrowUpRight, CalendarDays, Clock3, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ClassGallery } from "@/components/balanse/class-gallery/ClassGallery";
import type { ClassDetailPageProps } from "./ClassDetailPage.schema";
import "../classes-page/classes.css";

const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
const subscribe = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export function ClassDetailPage({
  gymClass: initial,
  coaches,
  sessions,
  preview = false,
}: ClassDetailPageProps) {
  const [previewSnapshot] = useState(() => {
    let snapshot = "";
    return () => {
      const next = window.location.hash;
      if (next.startsWith("#class-preview=")) snapshot = next;
      return snapshot;
    };
  });
  const hash = useSyncExternalStore(subscribe, previewSnapshot, () => "");
  const gymClass = preview ? parseClassPreview(hash) : initial;
  if (!gymClass)
    return (
      <div className="marketing-container py-24">
        <h1 className="text-3xl font-display">
          {preview ? "Class preview unavailable" : "Class unavailable"}
        </h1>
        <p className="my-6">
          {preview
            ? "Open a valid preview from the admin class form or class list."
            : "Explore our current classes to find your next practice."}
        </p>
        <Link href="/classes">Browse classes</Link>
      </div>
    );
  const roster = coaches.filter((coach) => gymClass.coachIds.includes(coach.id));
  const upcoming = sessions
    .filter((session) => session.classId === gymClass.id && session.reservable)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 4);
  return (
    <article className="class-detail">
      {preview && (
        <div className="class-preview-note">
          Unsaved layout preview · These changes are not published.
        </div>
      )}
      <header className="class-hero">
        {gymClass.heroImage && (
          <Image
            src={gymClass.heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            unoptimized={gymClass.heroImage.startsWith("https:")}
          />
        )}
        <div className="class-hero-shade" />
        <div className="marketing-container class-hero-content">
          <Link href="/classes" className="class-back">
            <ArrowLeft size={17} /> All classes
          </Link>
          <div>
            <p className="class-eyebrow">Move with Balansé</p>
            <h1>{gymClass.name}</h1>
            <p className="class-hero-description">{gymClass.shortDescription}</p>
            <a href="#book-class" className="class-button">
              Find your session <ArrowDown size={18} />
            </a>
          </div>
        </div>
      </header>
      <section className="class-coaches marketing-container" aria-labelledby="class-coaches-title">
        <div>
          <p className="class-eyebrow">People behind the practice</p>
          <h2 id="class-coaches-title">Your class coaches</h2>
          <p>Your session’s confirmed coaches are listed when booking.</p>
        </div>
        <div className="class-coach-roster">
          {roster.length ? (
            roster.map((coach) => (
              <Link
                href={`/coaches?specialty=${encodeURIComponent(gymClass.name)}`}
                className="class-coach"
                key={coach.id}
              >
                <CoachPhoto
                  photoKey={coach.photoKey}
                  name={coach.name}
                  className="class-coach-photo"
                />
                <span>{coach.name}</span>
              </Link>
            ))
          ) : (
            <p>Coaches will be announced soon.</p>
          )}
        </div>
      </section>
      <section className="class-about marketing-container" aria-labelledby="class-about-title">
        <div>
          <p className="class-eyebrow">Meet your practice</p>
          <h2 id="class-about-title">
            A little about
            <br />
            {gymClass.name}.
          </h2>
          {gymClass.defaultDurationMinutes && (
            <p className="class-duration">
              <Clock3 size={18} /> {gymClass.defaultDurationMinutes} minutes to move
            </p>
          )}
        </div>
        <div className="class-rich-text">
          {renderMarkdownSubset(gymClass.description || gymClass.shortDescription)}
        </div>
      </section>
      <ClassGallery images={gymClass.galleryImages} name={gymClass.name} />
      <section className="class-rate marketing-container" aria-labelledby="class-rate-title">
        <div>
          <p className="class-eyebrow">Make space for yourself</p>
          <h2 id="class-rate-title">
            One class.
            <br />
            Time well spent.
          </h2>
        </div>
        <div className="class-rate-amount">
          <Ticket size={26} aria-hidden="true" />
          <p>
            {gymClass.defaultPricePhp === null
              ? "See session pricing"
              : peso(gymClass.defaultPricePhp)}
            <span>per person, per session</span>
          </p>
          <small>Your selected session confirms the customer price before booking.</small>
        </div>
      </section>
      <section id="book-class" className="class-booking">
        <div className="marketing-container">
          <div className="class-booking-heading">
            <div>
              <p className="class-eyebrow">Your next good habit</p>
              <h2>See you in class.</h2>
            </div>
            <Link href={`/?classId=${encodeURIComponent(gymClass.id)}#schedule`}>
              Full schedule <ArrowUpRight size={18} />
            </Link>
          </div>
          {upcoming.length ? (
            <div className="class-session-list">
              {upcoming.map((session) => (
                <Link
                  href={`/portal/book/${session.id}`}
                  key={session.id}
                  className="class-session"
                >
                  <CalendarDays aria-hidden="true" />
                  <div>
                    <h3>{sessionDisplayName(session)}</h3>
                    <p>{dateLabel(session.startsAt)}</p>
                    <small>{session.coachName}</small>
                  </div>
                  <span>
                    {peso(session.pricePhp)}
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="class-no-sessions">
              <p>No bookable sessions are published for this class yet.</p>
              <Link href="/contact" className="class-button">
                Ask about the next class <ArrowUpRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
