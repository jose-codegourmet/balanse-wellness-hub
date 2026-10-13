import type { PrismaClient } from "@prisma/client";
import { MAIN_STUDIO_VENUE_ID } from "./venues";

const PLACEHOLDER_RATE = "500.00";
const MANDANI_BAY_VENUE_ID = "venue-mandani-bay";

type SessionSeed = {
  id: string;
  classId: string;
  venueId: string;
  name?: string;
  coachIds: string[];
  startsAt: string;
  endsAt: string;
  pricePhp: string;
  capacity: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
};

/**
 * The 12 showcase sessions from `packages/mock/src/fixtures.ts`
 * (`session-past-open` … `session-event-capoeira`) plus the draft event
 * session from `event-fixtures.ts` (WIRE-0412, #361), on the fixture's fixed
 * September–October 2026 dates (decision 8: no relative-date mode). Ids,
 * dates, classes, coaches, venues, capacities, and prices mirror the mock
 * exactly so the live and mock demo data tell the same story.
 */
const SESSIONS: readonly SessionSeed[] = [
  {
    id: "session-past-open",
    classId: "class-calisthenics",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-rex"],
    startsAt: "2026-09-14T00:00:00.000Z",
    endsAt: "2026-09-14T01:30:00.000Z",
    pricePhp: "550.00",
    capacity: 12,
    status: "PUBLISHED",
  },
  {
    id: "session-wed-cutoff",
    classId: "class-calisthenics",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-rex", "coach-ephraim"],
    startsAt: "2026-09-16T03:00:00.000Z",
    endsAt: "2026-09-16T04:30:00.000Z",
    pricePhp: "550.00",
    capacity: 12,
    status: "PUBLISHED",
  },
  {
    id: "session-wed-open",
    classId: "class-caliyoga",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-rex"],
    startsAt: "2026-09-16T07:00:00.000Z",
    endsAt: "2026-09-16T08:30:00.000Z",
    pricePhp: "550.00",
    capacity: 12,
    status: "PUBLISHED",
  },
  {
    id: "session-wed-nearly",
    classId: "class-yoga",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-wolf"],
    startsAt: "2026-09-16T08:30:00.000Z",
    endsAt: "2026-09-16T10:00:00.000Z",
    pricePhp: "500.00",
    capacity: 10,
    status: "PUBLISHED",
  },
  {
    id: "session-sat-full",
    classId: "class-kickboxing",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-rachelle"],
    startsAt: "2026-09-19T01:30:00.000Z",
    endsAt: "2026-09-19T03:00:00.000Z",
    pricePhp: "600.00",
    capacity: 10,
    status: "PUBLISHED",
  },
  {
    id: "session-fri-cancelled",
    classId: "class-groundworks",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-ephraim"],
    startsAt: "2026-09-18T03:00:00.000Z",
    endsAt: "2026-09-18T04:30:00.000Z",
    pricePhp: "550.00",
    capacity: 12,
    status: "CANCELLED",
  },
  {
    id: "session-sun-alec",
    classId: "class-calisthenics",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-alec"],
    startsAt: "2026-09-20T03:00:00.000Z",
    endsAt: "2026-09-20T04:30:00.000Z",
    pricePhp: "550.00",
    capacity: 12,
    status: "PUBLISHED",
  },
  {
    id: "session-sun-dance",
    classId: "class-dance",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-mikaela"],
    startsAt: "2026-09-20T07:00:00.000Z",
    endsAt: "2026-09-20T08:30:00.000Z",
    pricePhp: "500.00",
    capacity: 16,
    status: "PUBLISHED",
  },
  {
    id: "session-sat-groundworks",
    classId: "class-groundworks",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-ephraim"],
    startsAt: "2026-09-19T08:00:00.000Z",
    endsAt: "2026-09-19T09:30:00.000Z",
    pricePhp: "550.00",
    capacity: 12,
    status: "PUBLISHED",
  },
  {
    id: "session-thu-early",
    classId: "class-yoga",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-wolf"],
    startsAt: "2026-09-17T00:00:00.000Z",
    endsAt: "2026-09-17T01:30:00.000Z",
    pricePhp: "500.00",
    capacity: 12,
    status: "PUBLISHED",
  },
  // #343 — event sessions are ordinary bookable sessions; the event wraps them.
  {
    id: "session-event-pilates",
    classId: "class-pilates",
    venueId: MANDANI_BAY_VENUE_ID,
    name: "Pilates for a Cause",
    coachIds: ["coach-jodi", "coach-sofia"],
    startsAt: "2026-09-26T00:00:00.000Z",
    endsAt: "2026-09-26T01:30:00.000Z",
    pricePhp: "1000.00",
    capacity: 30,
    status: "PUBLISHED",
  },
  {
    id: "session-event-capoeira",
    classId: "class-groundworks",
    venueId: MAIN_STUDIO_VENUE_ID,
    name: "Capoeira Workshop",
    coachIds: ["coach-ephraim"],
    startsAt: "2026-10-10T00:00:00.000Z",
    endsAt: "2026-10-10T01:30:00.000Z",
    pricePhp: "900.00",
    capacity: 20,
    status: "PUBLISHED",
  },
  // `event-fixtures.ts` carries no coachIds for this one (its own session type
  // has no coach concept) — coach-rachelle teaches the only other Kickboxing
  // slot (`session-sat-full`), so she is the reasonable placeholder here too.
  {
    id: "session-event-self-defense",
    classId: "class-kickboxing",
    venueId: MAIN_STUDIO_VENUE_ID,
    coachIds: ["coach-rachelle"],
    startsAt: "2026-10-03T00:00:00.000Z",
    endsAt: "2026-10-03T02:00:00.000Z",
    pricePhp: "750.00",
    capacity: 16,
    status: "DRAFT",
  },
] as const;

type EventSeed = {
  id: string;
  sessionId: string;
  title: string;
  summary: string;
  description: string;
  posterImage: string | null;
  galleryImages: string[];
  beneficiary: string;
  whatToBring: string;
  internalNotes: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "ARCHIVED";
};

/**
 * Mirrors `packages/mock/src/event-fixtures.ts`. Seeded event media keeps its
 * bundled site paths; production uploads use signed-storage object keys. The
 * public reader accepts both forms (WIRE-1302 / #367).
 */
const EVENTS: readonly EventSeed[] = [
  {
    id: "event-pilates-cause",
    sessionId: "session-event-pilates",
    title: "Pilates for a Cause",
    summary: "Off-site pilates morning. Proceeds support Everlasting Hope Cebu.",
    description:
      "Registration at 7:30 AM, pilates at 8:00 AM, Mandani Bay Garden Area. Capped at the session capacity. This is a placeholder shaped like the 26 Sep 2026 announcement.",
    posterImage: "/assets/marketing/classes/mat-pilates-hero.webp",
    galleryImages: [
      "/assets/marketing/classes/mat-pilates-hero.webp",
      "/assets/marketing/classes/yoga-hero.webp",
    ],
    beneficiary: "Everlasting Hope Cebu, Banawa",
    whatToBring: "Mat, water, and a towel. The studio floor is not the venue.",
    internalNotes:
      "OQ-PRICE: session prices are non-authoritative placeholders. Editing the event does not change the session price.",
    registrationOpensAt: "2026-09-20T00:00:00.000Z",
    registrationClosesAt: "2026-09-25T23:30:00.000Z",
    status: "PUBLISHED",
  },
  {
    id: "event-self-defense-draft",
    sessionId: "session-event-self-defense",
    title: "Self-Defense Workshop",
    summary: "Draft workshop. The session is still a draft, so this event cannot be published.",
    description: "Placeholder for the upcoming self-defense workshop. Not yet announced.",
    posterImage: null,
    galleryImages: [],
    beneficiary: "",
    whatToBring: "Comfortable clothes and water.",
    internalNotes:
      "OQ-PRICE: session prices are non-authoritative placeholders. Editing the event does not change the session price.",
    registrationOpensAt: null,
    registrationClosesAt: null,
    status: "DRAFT",
  },
  {
    id: "event-capoeira-cancelled",
    sessionId: "session-event-capoeira",
    title: "Capoeira Workshop",
    summary: "Cancelled event. The linked session stays published.",
    description:
      "Placeholder for the capoeira workshop. Cancelling this event does not cancel the session or its bookings.",
    posterImage: null,
    galleryImages: [],
    beneficiary: "",
    whatToBring: "Comfortable clothes.",
    internalNotes:
      "OQ-PRICE: session prices are non-authoritative placeholders. Editing the event does not change the session price. Class attachment uses an existing class until #317 Q2 is answered.",
    registrationOpensAt: null,
    registrationClosesAt: null,
    status: "CANCELLED",
  },
] as const;

export async function seedSessions(prisma: PrismaClient): Promise<void> {
  for (const row of SESSIONS) {
    await prisma.gymSession.upsert({
      where: { id: row.id },
      create: {
        id: row.id,
        classId: row.classId,
        venueId: row.venueId,
        name: row.name ?? null,
        startsAt: new Date(row.startsAt),
        endsAt: new Date(row.endsAt),
        capacity: row.capacity,
        status: row.status,
        customerPrice: row.pricePhp,
        bookable: true,
        isPlaceholder: true,
        coaches: {
          create: row.coachIds.map((coachId) => ({
            coachId,
            coachRate: PLACEHOLDER_RATE,
            coachRateType: "PER_SESSION",
          })),
        },
      },
      update: {
        classId: row.classId,
        venueId: row.venueId,
        name: row.name ?? null,
        startsAt: new Date(row.startsAt),
        endsAt: new Date(row.endsAt),
        capacity: row.capacity,
        status: row.status,
        customerPrice: row.pricePhp,
        isPlaceholder: true,
      },
    });
  }

  for (const event of EVENTS) {
    await prisma.sessionEvent.upsert({
      where: { id: event.id },
      create: {
        id: event.id,
        sessionId: event.sessionId,
        title: event.title,
        summary: event.summary,
        description: event.description,
        posterImage: event.posterImage,
        galleryImages: event.galleryImages,
        beneficiary: event.beneficiary,
        whatToBring: event.whatToBring,
        internalNotes: event.internalNotes,
        registrationOpensAt: event.registrationOpensAt ? new Date(event.registrationOpensAt) : null,
        registrationClosesAt: event.registrationClosesAt
          ? new Date(event.registrationClosesAt)
          : null,
        status: event.status,
        isPlaceholder: true,
      },
      update: {
        title: event.title,
        summary: event.summary,
        description: event.description,
        posterImage: event.posterImage,
        galleryImages: event.galleryImages,
        beneficiary: event.beneficiary,
        whatToBring: event.whatToBring,
        internalNotes: event.internalNotes,
        registrationOpensAt: event.registrationOpensAt ? new Date(event.registrationOpensAt) : null,
        registrationClosesAt: event.registrationClosesAt
          ? new Date(event.registrationClosesAt)
          : null,
        status: event.status,
        isPlaceholder: true,
      },
    });
  }
}
