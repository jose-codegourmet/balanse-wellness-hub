import type { PublicCoach, PublicSession } from "./types";

export const LANDING_HERO_COPY =
  "Find your balance. Choose a class and reserve your spot." as const;

export const LANDING_SECTION_ORDER = [
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
] as const;

export type LandingSectionId = (typeof LANDING_SECTION_ORDER)[number];

export const ABOUT_SECTION_ORDER = [
  "about",
  "approach",
  "what-you-can-do",
  "meet-the-team",
  "how-booking-works",
  "view-schedule",
] as const;

export const ABOUT_APPROACH_PILLARS = ["Movement", "Wellness", "Community"] as const;

/** Class families from findings.md §3 — not the coaches-page filter examples. */
export const ABOUT_CLASS_FAMILIES = [
  "Yoga",
  "Mat Pilates",
  "Calisthenics",
  "Caliyoga",
  "Circuit Training",
  "Kickboxing",
  "Kids Classes",
  "Dance Fitness",
] as const;

export const BOOKING_STEPS = ["Calendar", "Reserve", "Pay", "Confirm"] as const;

export const CONTACT_DETAILS = {
  phone: "+63 968 220 9198",
  email: "balanse.wellnesshub@gmail.com",
  address: "Unit 2A, Capitol Centrum Building, N Escario, Cebu City, 6000",
  instagram: "@balanse.wellness",
  instagramHref: "https://www.instagram.com/balanse.wellness/",
  tiktok: "@balanse.wellness",
  tiktokHref: "https://www.tiktok.com/@balanse.wellness",
  whatsapp: "+63 917 722 2040",
  whatsappHref: "https://wa.me/639177222040",
  messenger: "Messenger",
  messengerHref: "https://www.facebook.com/balanse.wellness",
  openingHours: null,
  mapHref:
    "https://maps.google.com/?q=Unit+2A,+Capitol+Centrum+Building,+N+Escario,+Cebu+City,+6000",
  /** Contact channels are never a booking path. */
  bookingInvite: false,
} as const;

export type ContactFormInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactFormValidation =
  | { ok: false; errors: Partial<Record<keyof ContactFormInput, string>> }
  | { ok: true; outcome: "success" | "failure" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(input: ContactFormInput): ContactFormValidation {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  if (!input.name.trim()) errors.name = "Name is required.";
  if (!input.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(input.email.trim())) errors.email = "Enter a valid email.";
  if (!input.message.trim()) errors.message = "Message is required.";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const outcome = input.email.trim().toLowerCase() === "fail@example.com" ? "failure" : "success";
  return { ok: true, outcome };
}

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqGroup = {
  id: "booking" | "payment" | "waitlist" | "cancellation-reschedule" | "walk-ins";
  title: string;
  items: FaqItem[];
};

export const FAQ_GROUPS: readonly FaqGroup[] = [
  {
    id: "booking",
    title: "Booking",
    items: [
      {
        id: "faq-account",
        question: "Do I need an account?",
        answer:
          "Yes. Guests may browse the calendar, but an account is required to reserve a class.",
      },
      {
        id: "faq-someone-else",
        question: "Can I book for someone else?",
        answer:
          "No. A reservation belongs to the signed-in customer. There is no booking-for-someone-else flow.",
      },
      {
        id: "faq-multiple",
        question: "Can I book multiple classes in one day?",
        answer: "Yes. You may reserve more than one session on the same day when spots are open.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      {
        id: "faq-gcash",
        question: "GCash?",
        answer:
          "Yes. GCash is a supported manual payment path: you reserve, pay outside the app, then upload proof for admin review.",
      },
      {
        id: "faq-counter",
        question: "Pay at Counter?",
        answer:
          "Yes. Pay at Counter (cash) is the other supported path. Pay at the studio; admin records the payment and confirms.",
      },
      {
        id: "faq-auto-confirm",
        question: "Is payment automatically confirmed?",
        answer:
          "No. Payment is manual. Uploading proof or paying cash does not confirm the booking — an admin confirms it.",
      },
    ],
  },
  {
    id: "waitlist",
    title: "Waitlist",
    items: [
      {
        id: "faq-waitlist-how",
        question: "How does the waitlist work?",
        answer:
          "When a session is full, you may join the waitlist. Order is FIFO. Waitlisted guests do not pay and do not take a main-list spot.",
      },
      {
        id: "faq-waitlist-pay",
        question: "Do I pay to join the waitlist?",
        answer: "No. Payment starts only after you are promoted to an open spot.",
      },
    ],
  },
  {
    id: "cancellation-reschedule",
    title: "Cancellation / Reschedule",
    items: [
      {
        id: "faq-cancel",
        question: "How do I cancel a booking?",
        answer:
          "Open the booking and submit a cancellation request. An admin reviews the request and completes the cancellation. The app does not cancel instantly.",
      },
      {
        id: "faq-reschedule",
        question: "How do I reschedule?",
        answer:
          "Open the booking and submit a reschedule request for another published session. An admin reviews the request and completes the change.",
      },
    ],
  },
  {
    id: "walk-ins",
    title: "Walk-ins",
    items: [
      {
        id: "faq-walkin-app",
        question: "Can I walk in without using the app?",
        answer:
          "Walk-ins still use the same booking system. Scan the Balansé QR, sign in or create an account, then reserve on the calendar.",
      },
      {
        id: "faq-walkin-channel",
        question: "Is walk-in a separate booking channel?",
        answer:
          "No. Physical presence does not skip the account requirement or create a side channel. You book in the same app.",
      },
    ],
  },
] as const;

export function cancellationRescheduleAnswers(): string[] {
  const group = FAQ_GROUPS.find((item) => item.id === "cancellation-reschedule");
  return group?.items.map((item) => item.answer) ?? [];
}

export function flattenFaqs(): FaqItem[] {
  return FAQ_GROUPS.flatMap((group) => group.items);
}

export function filterFaqs(query: string, items: readonly FaqItem[] = flattenFaqs()): FaqItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];
  return items.filter((item) =>
    `${item.question} ${item.answer} ${item.id}`.toLowerCase().includes(needle),
  );
}

/** Owner-confirmed roster from findings.md §4b. */
export const CONFIRMED_COACH_ROSTER = [
  { name: "Rex Francis Regis", specialties: ["Calisthenics", "Mat Pilates", "Caliyoga"] },
  { name: "Ephraim Bacaltos", specialties: ["Circuit Training", "Groundworks", "Calisthenics"] },
  { name: "Rachelle Tobiano", specialties: ["Kickboxing", "Brazilian Jiu-Jitsu"] },
  { name: "Alec James Co", specialties: ["Calisthenics", "Circuit Training"] },
  { name: "Jodi Tio", specialties: ["Mat Pilates"] },
  { name: "Wolf", specialties: ["Yoga"] },
  { name: "Kate Go", specialties: ["Yoga"] },
  { name: "Sofia Ocampo", specialties: ["Mat Pilates"] },
  { name: "Mikaela Danielle", specialties: ["Dance Fitness"] },
  { name: "Maris Cabrera", specialties: ["Dance Fitness"] },
  { name: "Francis Acido", specialties: ["Dance Fitness"] },
] as const;

export type PublicCoachCardFields = Pick<
  PublicCoach,
  "photoKey" | "name" | "specialties" | "shortBio"
>;

export function publicCoachCardFields(
  coach: PublicCoach | (PublicCoach & Record<string, unknown>),
): PublicCoachCardFields {
  return {
    photoKey: coach.photoKey,
    name: coach.name,
    specialties: coach.specialties,
    shortBio: coach.shortBio,
  };
}

export function landingScheduleHref(opts?: { coachId?: string; classId?: string }): string {
  const params = new URLSearchParams();
  if (opts?.coachId) params.set("coachId", opts.coachId);
  if (opts?.classId) params.set("classId", opts.classId);
  const query = params.toString();
  return query ? `/?${query}#schedule` : "/#schedule";
}

export function coachViewClassesHref(coachId: string): string {
  return landingScheduleHref({ coachId });
}

export function coachSpecialtyChips(coaches: readonly PublicCoach[]): string[] {
  const unique = [...new Set(coaches.flatMap((coach) => coach.specialties))].sort((a, b) =>
    a.localeCompare(b),
  );
  return ["All", ...unique];
}

export function filterPublicCoaches(
  coaches: readonly PublicCoach[],
  specialty: string,
): PublicCoach[] {
  if (specialty === "All") return [...coaches];
  return coaches.filter((coach) => coach.specialties.includes(specialty));
}

export function filterPublicSessions(
  sessions: readonly PublicSession[],
  filters: { classId?: string; coachId?: string },
): PublicSession[] {
  return sessions.filter((session) => {
    if (filters.classId && filters.classId !== "all" && session.classId !== filters.classId) {
      return false;
    }
    if (filters.coachId && filters.coachId !== "all" && session.coachId !== filters.coachId) {
      return false;
    }
    return true;
  });
}

export function teachesBio(specialties: readonly string[]): string {
  return `Teaches ${specialties.join(" / ")}.`;
}
