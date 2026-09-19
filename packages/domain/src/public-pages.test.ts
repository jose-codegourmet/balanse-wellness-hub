import { describe, expect, it } from "vitest";
import {
  ABOUT_APPROACH_PILLARS,
  ABOUT_CLASS_FAMILIES,
  ABOUT_SECTION_ORDER,
  BOOKING_STEPS,
  CONFIRMED_COACH_ROSTER,
  CONTACT_DETAILS,
  cancellationRescheduleAnswers,
  coachSpecialtyChips,
  coachViewClassesHref,
  FAQ_GROUPS,
  filterFaqs,
  filterPublicCoaches,
  filterPublicSessions,
  LANDING_HERO_COPY,
  LANDING_SECTION_ORDER,
  landingScheduleHref,
  publicCoachCardFields,
  renderCoachCardPlainText,
  validateContactForm,
} from "./public-pages";
import type { PublicCoach, PublicSession } from "./types";

const sampleCoach: PublicCoach = {
  id: "coach-wolf",
  name: "Wolf",
  specialties: ["Yoga"],
  shortBio: "Teaches Yoga.",
  photoKey: "coach-photos/wolf",
  active: true,
};

describe("FE-PUB public page contracts", () => {
  it("locks landing section order including calendar as the hero", () => {
    expect(LANDING_SECTION_ORDER).toEqual([
      "header",
      "hero-copy",
      "calendar-hero",
      "session-panel",
      "how-it-works",
      "classes",
      "coaches",
      "about",
      "location",
      "final-cta",
      "footer",
    ]);
    expect(LANDING_HERO_COPY).toBe("Find your balance. Choose a class and reserve your spot.");
    expect(landingScheduleHref()).toBe("/#schedule");
    expect(landingScheduleHref({ coachId: "coach-wolf" })).toBe("/?coachId=coach-wolf#schedule");
  });

  it("keeps About blocks in spec order with findings class families and booking steps", () => {
    expect(ABOUT_SECTION_ORDER).toEqual([
      "about",
      "approach",
      "what-you-can-do",
      "meet-the-team",
      "how-booking-works",
      "view-schedule",
    ]);
    expect(ABOUT_APPROACH_PILLARS).toEqual(["Movement", "Wellness", "Community"]);
    expect(ABOUT_CLASS_FAMILIES).toEqual([
      "Yoga",
      "Mat Pilates",
      "Calisthenics",
      "Caliyoga",
      "Circuit Training",
      "Kickboxing",
      "Kids Classes",
      "Dance Fitness",
    ]);
    expect(BOOKING_STEPS).toEqual(["Calendar", "Reserve", "Pay", "Confirm"]);
  });

  it("exposes verified contact details and no invented hours", () => {
    expect(CONTACT_DETAILS.phone).toBe("+63 968 220 9198");
    expect(CONTACT_DETAILS.email).toBe("balanse.wellnesshub@gmail.com");
    expect(CONTACT_DETAILS.address).toBe(
      "Unit 2A, Capitol Centrum Building, N Escario, Cebu City, 6000",
    );
    expect(CONTACT_DETAILS.instagram).toBe("@balanse.wellness");
    expect(CONTACT_DETAILS.tiktok).toBe("@balanse.wellness");
    expect(CONTACT_DETAILS.whatsapp).toBe("+63 917 722 2040");
    expect(CONTACT_DETAILS.messenger).toBe("Messenger");
    expect(CONTACT_DETAILS.openingHours).toBeNull();
    expect(CONTACT_DETAILS.mapHref).toContain("maps.google.com");
    expect(CONTACT_DETAILS.bookingInvite).toBe(false);
  });

  it("validates the mock contact form without implying a network call", () => {
    expect(validateContactForm({ name: "", email: "", message: "" }).ok).toBe(false);
    expect(
      validateContactForm({
        name: "Ana",
        email: "not-an-email",
        message: "Hello there from Cebu.",
      }).ok,
    ).toBe(false);
    expect(
      validateContactForm({
        name: "Ana",
        email: "ana@example.com",
        message: "Hello there from Cebu.",
      }),
    ).toEqual({ ok: true, outcome: "success" });
    expect(
      validateContactForm({
        name: "Ana",
        email: "fail@example.com",
        message: "Hello there from Cebu.",
      }),
    ).toEqual({ ok: true, outcome: "failure" });
  });

  it("covers the five FAQ groups with canonical answers and no cancel timing or refund-eligibility claims", () => {
    expect(FAQ_GROUPS.map((group) => group.id)).toEqual([
      "booking",
      "payment",
      "waitlist",
      "cancellation-reschedule",
      "walk-ins",
    ]);
    const questions = FAQ_GROUPS.flatMap((group) => group.items.map((item) => item.question));
    expect(questions).toEqual(
      expect.arrayContaining([
        "Do I need an account?",
        "Can I book for someone else?",
        "Can I book multiple classes in one day?",
        "GCash?",
        "Pay at Counter?",
        "Is payment automatically confirmed?",
      ]),
    );
    const answers = FAQ_GROUPS.flatMap((group) => group.items.map((item) => item.answer)).join(" ");
    expect(answers.toLowerCase()).toContain("account");
    expect(answers.toLowerCase()).toContain("gcash");
    expect(answers.toLowerCase()).toContain("fifo");
    expect(answers.toLowerCase()).not.toMatch(/refund eligib|hours before|deadline|cutoff/);
    for (const answer of cancellationRescheduleAnswers()) {
      expect(answer.toLowerCase()).not.toMatch(/refund|hours before|deadline|cutoff|eligible/);
    }
  });

  it("filters FAQ questions client-side", () => {
    expect(filterFaqs("gcash").every((item) => /gcash/i.test(item.question + item.answer))).toBe(
      true,
    );
    expect(filterFaqs("xyz-no-match")).toEqual([]);
  });

  it("builds coach cards without rate or cost fields and matches the confirmed roster", () => {
    expect(CONFIRMED_COACH_ROSTER).toEqual([
      { name: "Rex Francis Regis", specialties: ["Calisthenics", "Mat Pilates", "Caliyoga"] },
      {
        name: "Ephraim Bacaltos",
        specialties: ["Circuit Training", "Groundworks", "Calisthenics"],
      },
      { name: "Rachelle Tobiano", specialties: ["Kickboxing", "Brazilian Jiu-Jitsu"] },
      { name: "Alec James Co", specialties: ["Calisthenics", "Circuit Training"] },
      { name: "Jodi Tio", specialties: ["Mat Pilates"] },
      { name: "Wolf", specialties: ["Yoga"] },
      { name: "Kate Go", specialties: ["Yoga"] },
      { name: "Sofia Ocampo", specialties: ["Mat Pilates"] },
      { name: "Mikaela Danielle", specialties: ["Dance Fitness"] },
      { name: "Maris Cabrera", specialties: ["Dance Fitness"] },
      { name: "Francis Acido", specialties: ["Dance Fitness"] },
    ]);
    const card = publicCoachCardFields({
      ...sampleCoach,
      defaultRatePhp: 650,
      rateType: "PER_SESSION",
    } as PublicCoach & { defaultRatePhp: number; rateType: string });
    expect(Object.keys(card).sort()).toEqual(["name", "photoKey", "shortBio", "specialties"]);
    expect(JSON.stringify(card)).not.toMatch(/rate|cost|php/i);
    expect(renderCoachCardPlainText(sampleCoach)).not.toMatch(/rate|cost|php/i);
    expect(coachViewClassesHref("coach-wolf")).toBe("/?coachId=coach-wolf#schedule");
  });

  it("filters coaches by specialty and sessions by coach", () => {
    const coaches: PublicCoach[] = [
      sampleCoach,
      {
        id: "coach-jodi",
        name: "Jodi Tio",
        specialties: ["Mat Pilates"],
        shortBio: "Teaches Mat Pilates.",
        photoKey: "coach-photos/jodi-tio",
        active: true,
      },
    ];
    expect(coachSpecialtyChips(coaches)).toEqual(["All", "Mat Pilates", "Yoga"]);
    expect(filterPublicCoaches(coaches, "Yoga").map((coach) => coach.id)).toEqual(["coach-wolf"]);
    expect(filterPublicCoaches(coaches, "Boxing")).toEqual([]);
    const sessions = [
      { id: "a", classId: "class-yoga", coachId: "coach-wolf" },
      { id: "b", classId: "class-pilates", coachId: "coach-jodi" },
    ] as PublicSession[];
    expect(filterPublicSessions(sessions, { coachId: "coach-wolf" }).map((s) => s.id)).toEqual([
      "a",
    ]);
    expect(
      filterPublicSessions(sessions, { classId: "class-pilates", coachId: "coach-wolf" }),
    ).toEqual([]);
  });
});
