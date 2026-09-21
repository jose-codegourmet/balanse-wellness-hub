import {
  ABOUT_APPROACH_PILLARS,
  ABOUT_CLASS_FAMILIES,
  BOOKING_STEPS,
  publicCoachCardFields,
} from "@balanse/domain";
import { CoachPhoto, MarketingImage, ScrollReveal } from "@balanse/ui";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  CreditCard,
  Dumbbell,
  Flower2,
  Footprints,
  Heart,
  MoveUpRight,
  Music2,
  Sparkles,
  Ticket,
  Users,
  Wind,
} from "lucide-react";
import Link from "next/link";
import type { AboutPageProps } from "./AboutPage.schema";
import "./about-page.css";

const pillars = {
  Movement: {
    icon: MoveUpRight,
    copy: "Find strength in the effort. Freedom in the movement. A practice you can make your own.",
  },
  Wellness: {
    icon: Flower2,
    copy: "Make room for a deeper breath. Recovery and tranquility belong beside the training.",
  },
  Community: {
    icon: Users,
    copy: "Share the energy. Learn together. Find a little encouragement in the people around you.",
  },
};
const classIcons = [Wind, Flower2, Dumbbell, Heart, MoveUpRight, Footprints, Sparkles, Music2];
const bookingIcons = [CalendarDays, Ticket, CreditCard, CircleCheck];
const bookingCopy = [
  "Find a class and a time that fits your week.",
  "Log in and reserve your place in the session.",
  "Choose GCash or Pay at Counter.",
  "The studio confirms your reservation after payment.",
];

export function AboutPage({ coaches }: AboutPageProps) {
  return (
    <article className="about-page">
      <section data-about-block="about" className="about-intro marketing-container">
        <div className="about-intro-top">
          <p className="marketing-eyebrow">About Balansé · Cebu City</p>
          <span className="about-small-note">A little movement. A little more you.</span>
        </div>
        <div className="about-intro-copy">
          <h1>
            Come for the movement.
            <br />
            <em>Stay for the feeling.</em>
          </h1>
          <div>
            <p>
              A space to build strength, find your balance, and feel part of something. This is
              Balansé.
            </p>
            <Link href="/#schedule" className="about-button">
              Find your next class <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
        <div className="about-hero-photos">
          <MarketingImage
            assetId="about-b"
            frameRatio="16:9"
            loading="eager"
            className="about-main-photo"
            sizes="(max-width: 767px) 100vw, 75vw"
          />
          <div className="about-photo-aside">
            <MarketingImage
              assetId="about-a"
              frameRatio="4:5"
              loading="eager"
              className="about-detail-photo"
              sizes="(max-width: 767px) 40vw, 25vw"
            />
            <p>
              A space to slow down.
              <br />
              Room to grow.
            </p>
          </div>
          <a href="#our-approach" className="about-round-link" aria-label="Discover our approach">
            <ArrowDown size={25} strokeWidth={1.3} aria-hidden="true" />
          </a>
        </div>
        <div className="about-intro-footer">
          <span>Movement / Wellness / Community</span>
          <span>Find your own balance.</span>
        </div>
      </section>
      <section
        id="our-approach"
        data-about-block="approach"
        className="about-approach marketing-container"
      >
        <ScrollReveal>
          <div className="about-section-heading">
            <p className="marketing-eyebrow">01 / Our approach</p>
            <h2>
              More than a workout.
              <br />
              <em>A way to feel well.</em>
            </h2>
            <p>
              We bring movement, fitness education, recovery, and tranquility together. Through
              classes, workshops, and community, there’s room to explore what balance means to you.
            </p>
          </div>
        </ScrollReveal>
        <div className="about-pillars">
          {ABOUT_APPROACH_PILLARS.map((pillar, index) => {
            const Icon = pillars[pillar].icon;
            return (
              <ScrollReveal key={pillar} delay={index * 0.08}>
                <div className="about-pillar">
                  <Icon size={32} strokeWidth={1.25} aria-hidden="true" />
                  <span className="about-pillar-number">0{index + 1}</span>
                  <h3>{pillar}</h3>
                  <p>{pillars[pillar].copy}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
      <section data-about-block="what-you-can-do" className="about-classes">
        <div className="marketing-container about-classes-inner">
          <div>
            <p className="marketing-eyebrow">02 / Find your movement</p>
            <h2>
              Some days, strength.
              <br />
              Some days, <em>stillness.</em>
            </h2>
            <p className="about-body">
              Follow your curiosity. Try a different pace. Explore the classes on our weekly
              calendar.
            </p>
            <MarketingImage
              assetId="about-d"
              frameRatio="4:3"
              className="about-class-photo"
              sizes="(max-width: 767px) 100vw, 40vw"
            />
          </div>
          <ul className="about-class-list">
            {ABOUT_CLASS_FAMILIES.map((name, index) => {
              const Icon = classIcons[index];
              return (
                <li key={name}>
                  <Link href="/#schedule">
                    <Icon size={22} strokeWidth={1.35} aria-hidden="true" />
                    <span>{name}</span>
                    <ArrowUpRight className="about-class-arrow" size={20} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section data-about-block="meet-the-team" className="about-team marketing-container">
        <div className="about-team-heading">
          <div>
            <p className="marketing-eyebrow">03 / The people behind the practice</p>
            <h2>
              Good energy.
              <br />
              <em>Familiar faces.</em>
            </h2>
          </div>
          <div>
            <p className="about-body">
              Meet the coaches bringing their own disciplines, perspectives, and energy to Balansé.
            </p>
            <Link href="/coaches" className="marketing-text-link">
              Meet all the coaches <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <ul className="about-coaches">
          {coaches.slice(0, 3).map((coach, index) => {
            const card = publicCoachCardFields(coach);
            return (
              <li key={coach.id}>
                <ScrollReveal delay={index * 0.08}>
                  <Link href="/coaches" className="about-coach" aria-label={`Meet ${card.name}`}>
                    <CoachPhoto
                      photoKey={card.photoKey}
                      name={card.name}
                      ratio="4:5"
                      className="about-coach-photo"
                    />
                    <div className="about-coach-name">
                      <h3>{card.name}</h3>
                      <ArrowUpRight size={20} aria-hidden="true" />
                    </div>
                    <p>{card.specialties.join(" · ")}</p>
                  </Link>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>
      </section>
      <section data-about-block="how-booking-works" className="about-booking marketing-container">
        <div className="about-booking-heading">
          <p className="marketing-eyebrow">04 / Make time for yourself</p>
          <h2>
            Your first class,
            <br />
            <em>four simple steps.</em>
          </h2>
        </div>
        <ol className="about-steps">
          {BOOKING_STEPS.map((step, index) => {
            const Icon = bookingIcons[index];
            return (
              <li key={step}>
                <div className="about-step-top">
                  <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
                  <span>0{index + 1}</span>
                </div>
                <h3>{step}</h3>
                <p>{bookingCopy[index]}</p>
              </li>
            );
          })}
        </ol>
      </section>
      <section data-about-block="view-schedule" className="about-close marketing-container">
        <div className="about-close-panel">
          <MarketingImage
            assetId="about-c"
            decorative
            frameRatio="3:1"
            className="about-close-texture"
          />
          <div className="about-close-content">
            <Flower2 size={38} strokeWidth={1.1} aria-hidden="true" />
            <p className="marketing-eyebrow">See you at the studio</p>
            <h2>
              A little time.
              <br />
              <em>Just for you.</em>
            </h2>
            <p>Start with one class. See how you feel.</p>
            <Link href="/#schedule" className="about-button">
              View the schedule <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
