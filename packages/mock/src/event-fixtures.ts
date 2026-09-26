import type { EventStatus, SessionStatus } from "@balanse/domain";

/**
 * OQ-PRICE: every `customerPrice` on these fixtures is a non-authoritative
 * placeholder. The ₱1,000 Pilates for a Cause figure is the Facebook
 * announcement, not a catalogue price. Do not treat it as authoritative.
 */
export const EVENT_FIXTURE_PRICE_NOTE =
  "OQ-PRICE: session prices on event fixtures are non-authoritative placeholders.";

/** Timetable session that deliberately has no event (1:0..1). */
export const EVENT_FIXTURE_SESSION_WITHOUT_EVENT = "session-wed-open";

export type EventFixtureSession = {
  id: string;
  classId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  /** Non-authoritative placeholder. See `EVENT_FIXTURE_PRICE_NOTE`. */
  customerPrice: string;
  priceNonAuthoritative: true;
  status: SessionStatus;
};

export type StoredSessionEvent = {
  id: string;
  sessionId: string;
  title: string;
  summary: string;
  description: string;
  posterImage: string | null;
  galleryImages: string[];
  venueName: string;
  venueAddress: string;
  beneficiary: string;
  whatToBring: string;
  internalNotes: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  status: EventStatus;
  isPlaceholder: boolean;
  createdAt: string;
  updatedAt: string;
};

const PRICE_NOTE = `${EVENT_FIXTURE_PRICE_NOTE} Editing the event does not change the session price.`;

export const eventFixtureSessions: readonly EventFixtureSession[] = [
  {
    id: "session-event-pilates",
    classId: "class-pilates",
    startsAt: "2026-09-26T00:00:00.000Z",
    endsAt: "2026-09-26T01:30:00.000Z",
    capacity: 30,
    customerPrice: "1000.00",
    priceNonAuthoritative: true,
    status: "PUBLISHED",
  },
  {
    id: "session-event-self-defense",
    classId: "class-kickboxing",
    startsAt: "2026-10-03T00:00:00.000Z",
    endsAt: "2026-10-03T02:00:00.000Z",
    capacity: 16,
    customerPrice: "750.00",
    priceNonAuthoritative: true,
    status: "DRAFT",
  },
  {
    id: "session-event-capoeira",
    classId: "class-groundworks",
    startsAt: "2026-10-10T00:00:00.000Z",
    endsAt: "2026-10-10T01:30:00.000Z",
    capacity: 20,
    customerPrice: "900.00",
    priceNonAuthoritative: true,
    status: "PUBLISHED",
  },
];

export const eventFixtures: StoredSessionEvent[] = [
  {
    id: "event-pilates-cause",
    sessionId: "session-event-pilates",
    title: "Pilates for a Cause",
    summary: "Off-site pilates morning. Proceeds support Everlasting Hope Cebu.",
    description:
      "Registration at 7:30 AM, pilates at 8:00 AM, Mandani Bay Garden Area. Capped at the session capacity. This is a placeholder shaped like the 26 Sep 2026 announcement.",
    posterImage: null,
    galleryImages: [],
    venueName: "Mandani Bay — Garden Area",
    venueAddress: "Mandani Bay, Cebu",
    beneficiary: "Everlasting Hope Cebu, Banawa",
    whatToBring: "Mat, water, and a towel. The studio floor is not the venue.",
    internalNotes: PRICE_NOTE,
    registrationOpensAt: "2026-09-20T00:00:00.000Z",
    registrationClosesAt: "2026-09-25T23:30:00.000Z",
    status: "PUBLISHED",
    isPlaceholder: true,
    createdAt: "2026-09-16T02:00:00.000Z",
    updatedAt: "2026-09-16T02:00:00.000Z",
  },
  {
    id: "event-self-defense-draft",
    sessionId: "session-event-self-defense",
    title: "Self-Defense Workshop",
    summary: "Draft workshop. The session is still a draft, so this event cannot be published.",
    description: "Placeholder for the upcoming self-defense workshop. Not yet announced.",
    posterImage: null,
    galleryImages: [],
    venueName: "Balansé Wellness Hub",
    venueAddress: "Unit 2A, Capitol Centrum Building, N Escario, Cebu City",
    beneficiary: "",
    whatToBring: "Comfortable clothes and water.",
    internalNotes: PRICE_NOTE,
    registrationOpensAt: null,
    registrationClosesAt: null,
    status: "DRAFT",
    isPlaceholder: true,
    createdAt: "2026-09-16T02:10:00.000Z",
    updatedAt: "2026-09-16T02:10:00.000Z",
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
    venueName: "Balansé Wellness Hub",
    venueAddress: "Unit 2A, Capitol Centrum Building, N Escario, Cebu City",
    beneficiary: "",
    whatToBring: "Comfortable clothes.",
    internalNotes: `${PRICE_NOTE} Class attachment uses an existing class until #317 Q2 is answered.`,
    registrationOpensAt: null,
    registrationClosesAt: null,
    status: "CANCELLED",
    isPlaceholder: true,
    createdAt: "2026-09-15T02:00:00.000Z",
    updatedAt: "2026-09-16T01:00:00.000Z",
  },
];
