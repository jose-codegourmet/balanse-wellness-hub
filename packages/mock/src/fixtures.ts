import type {
  AdminClass,
  AdminCoach,
  AdminSession,
  AdminSettings,
  AdminStaff,
  BookingStatus,
  CustomerBooking,
  CustomerProfile,
  PaymentInstructions,
  PolicyAcceptance,
  PublicClass,
  PublicCoach,
  PublicContent,
  PublicSession,
} from "@balanse/domain";
import {
  BOOKING_STATUSES,
  coachPhotoKey,
  flattenFaqs,
  sessionCoachCost,
  snapshotRateFromCoach,
  teachesBio,
} from "@balanse/domain";

import { classContent } from "./class-content";

/** Frozen "now" so Storybook and screenshots stay deterministic. Wed 10:50 Asia/Manila. */
export const MOCK_NOW_ISO = "2026-09-16T02:50:00.000Z";

export const MOCK_SEED = 20260916;

export const publicClasses: PublicClass[] = [
  {
    id: "class-yoga",
    name: "Yoga",
    shortDescription: "Mindful movement and breath.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 500,
    active: true,
  },
  {
    id: "class-pilates",
    name: "Mat Pilates",
    shortDescription: "Core-focused mat work.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 550,
    active: true,
  },
  {
    id: "class-calisthenics",
    name: "Calisthenics",
    shortDescription: "Strength through bodyweight skill.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 550,
    active: true,
  },
  {
    id: "class-caliyoga",
    name: "Caliyoga",
    shortDescription: "Calisthenics meeting yoga.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 550,
    active: true,
  },
  {
    id: "class-circuit",
    name: "Circuit Training",
    shortDescription: "Functional conditioning circuits.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 500,
    active: true,
  },
  {
    id: "class-kickboxing",
    name: "Kickboxing",
    shortDescription: "Striking, pads, and cardio.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 600,
    active: true,
  },
  {
    id: "class-bjj",
    name: "Brazilian Jiu-Jitsu",
    shortDescription: "Ground grappling fundamentals.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 600,
    active: true,
  },
  {
    id: "class-groundworks",
    name: "Groundworks",
    shortDescription: "Floor strength and mobility.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 550,
    active: true,
  },
  {
    id: "class-dance",
    name: "Dance Fitness",
    shortDescription: "Groove, Femme, Contemporary, and more.",
    defaultDurationMinutes: 90,
    defaultPricePhp: 500,
    active: true,
  },
].map((row) => ({ ...row, ...classContent[row.id] }));

const coachRows: AdminCoach[] = [
  {
    id: "coach-rex",
    name: "Rex Francis Regis",
    specialties: ["Calisthenics", "Mat Pilates", "Caliyoga"],
    shortBio: teachesBio(["Calisthenics", "Mat Pilates", "Caliyoga"]),
    photoKey: coachPhotoKey("rex-francis-regis"),
    active: true,
    defaultRatePhp: 800,
    rateType: "PER_SESSION",
    staffId: "staff-rex",
  },
  {
    id: "coach-ephraim",
    name: "Ephraim Bacaltos",
    specialties: ["Circuit Training", "Groundworks", "Calisthenics"],
    shortBio: teachesBio(["Circuit Training", "Groundworks", "Calisthenics"]),
    photoKey: coachPhotoKey("ephraim-bacaltos"),
    active: true,
    defaultRatePhp: 700,
    rateType: "PER_SESSION",
    staffId: null,
  },
  {
    id: "coach-rachelle",
    name: "Rachelle Tobiano",
    specialties: ["Kickboxing", "Brazilian Jiu-Jitsu"],
    shortBio: teachesBio(["Kickboxing", "Brazilian Jiu-Jitsu"]),
    photoKey: coachPhotoKey("rachelle-tobiano"),
    active: true,
    defaultRatePhp: 750,
    rateType: "PER_SESSION",
    staffId: null,
  },
  {
    id: "coach-alec",
    name: "Alec James Co",
    specialties: ["Calisthenics", "Circuit Training"],
    shortBio: teachesBio(["Calisthenics", "Circuit Training"]),
    photoKey: null,
    active: true,
    defaultRatePhp: 700,
    rateType: "PER_SESSION",
    staffId: null,
  },
  {
    id: "coach-jodi",
    name: "Jodi Tio",
    specialties: ["Mat Pilates"],
    shortBio: teachesBio(["Mat Pilates"]),
    photoKey: coachPhotoKey("jodi-tio"),
    active: true,
    defaultRatePhp: 700,
    rateType: "PER_HOUR",
    staffId: null,
  },
  {
    id: "coach-wolf",
    name: "Wolf",
    specialties: ["Yoga"],
    shortBio: teachesBio(["Yoga"]),
    photoKey: coachPhotoKey("wolf"),
    active: true,
    defaultRatePhp: 650,
    rateType: "PER_SESSION",
    staffId: null,
  },
  {
    id: "coach-kate",
    name: "Kate Go",
    specialties: ["Yoga"],
    shortBio: teachesBio(["Yoga"]),
    photoKey: null,
    active: true,
    defaultRatePhp: 650,
    rateType: "PER_SESSION",
    staffId: null,
  },
  {
    id: "coach-sofia",
    name: "Sofia Ocampo",
    specialties: ["Mat Pilates"],
    shortBio: teachesBio(["Mat Pilates"]),
    photoKey: null,
    active: true,
    defaultRatePhp: 650,
    rateType: "PER_SESSION",
    staffId: null,
  },
  {
    id: "coach-mikaela",
    name: "Mikaela Danielle",
    specialties: ["Dance Fitness"],
    shortBio: teachesBio(["Dance Fitness"]),
    photoKey: coachPhotoKey("mikaela-danielle"),
    active: true,
    defaultRatePhp: 650,
    rateType: "PER_SESSION",
    staffId: null,
  },
  {
    id: "coach-maris",
    name: "Maris Cabrera",
    specialties: ["Dance Fitness"],
    shortBio: teachesBio(["Dance Fitness"]),
    photoKey: coachPhotoKey("maris-cabrera"),
    active: true,
    defaultRatePhp: 650,
    rateType: "PER_SESSION",
    staffId: null,
  },
  {
    id: "coach-francis",
    name: "Francis Acido",
    specialties: ["Dance Fitness"],
    shortBio: teachesBio(["Dance Fitness"]),
    photoKey: coachPhotoKey("francis-acido"),
    active: true,
    defaultRatePhp: 650,
    rateType: "PER_SESSION",
    staffId: null,
  },
];

export const adminCoaches: AdminCoach[] = coachRows;

export function toPublicCoach(coach: AdminCoach): PublicCoach {
  const { defaultRatePhp: _rate, rateType: _type, staffId: _staffId, ...publicCoach } = coach;
  return publicCoach;
}

export const publicCoaches: PublicCoach[] = coachRows.map(toPublicCoach);

function session(
  partial: Omit<PublicSession, "className" | "coachName" | "coaches"> & {
    className?: string;
    coachName?: string;
    coachIds: string[];
  },
): PublicSession {
  const cls = publicClasses.find((c) => c.id === partial.classId);
  const assigned = partial.coachIds.map((id) => {
    const coach = publicCoaches.find((row) => row.id === id);
    if (!coach) throw new Error(`Unknown fixture coach: ${id}`);
    return coach;
  });
  const { coachIds: _ids, ...fields } = partial;
  return {
    ...fields,
    coaches: assigned.map(({ id, name, photoKey }) => ({ id, name, photoKey })),
    className: partial.className ?? cls?.name ?? "Class",
    coachName: partial.coachName ?? assigned.map((coach) => coach.name).join(", "),
  };
}

export const MOCK_PROOF_PREVIEW_URL = "/assets/placeholders/coach-placeholder-1x1.svg";

export const publicSessions: PublicSession[] = [
  session({
    id: "session-past-open",
    classId: "class-calisthenics",
    coachIds: ["coach-rex"],
    startsAt: "2026-09-14T00:00:00.000Z",
    endsAt: "2026-09-14T01:30:00.000Z",
    pricePhp: 550,
    capacity: 12,
    remainingSlots: 4,
    reservable: false,
    availability: "past",
    status: "PUBLISHED",
  }),
  session({
    id: "session-wed-cutoff",
    classId: "class-calisthenics",
    coachIds: ["coach-rex", "coach-ephraim"],
    startsAt: "2026-09-16T03:00:00.000Z",
    endsAt: "2026-09-16T04:30:00.000Z",
    pricePhp: 550,
    capacity: 12,
    remainingSlots: 6,
    reservable: false,
    availability: "past_cutoff",
    status: "PUBLISHED",
  }),
  session({
    id: "session-wed-open",
    classId: "class-caliyoga",
    coachIds: ["coach-rex"],
    startsAt: "2026-09-16T07:00:00.000Z",
    endsAt: "2026-09-16T08:30:00.000Z",
    pricePhp: 550,
    capacity: 12,
    remainingSlots: 8,
    reservable: true,
    availability: "open",
    status: "PUBLISHED",
  }),
  session({
    id: "session-wed-nearly",
    classId: "class-yoga",
    coachIds: ["coach-wolf"],
    startsAt: "2026-09-16T08:30:00.000Z",
    endsAt: "2026-09-16T10:00:00.000Z",
    pricePhp: 500,
    capacity: 10,
    remainingSlots: 1,
    reservable: true,
    availability: "nearly_full",
    status: "PUBLISHED",
  }),
  session({
    id: "session-sat-full",
    classId: "class-kickboxing",
    coachIds: ["coach-rachelle"],
    startsAt: "2026-09-19T01:30:00.000Z",
    endsAt: "2026-09-19T03:00:00.000Z",
    pricePhp: 600,
    capacity: 10,
    remainingSlots: 0,
    reservable: false,
    availability: "full_with_waitlist",
    status: "PUBLISHED",
  }),
  session({
    id: "session-fri-cancelled",
    classId: "class-groundworks",
    coachIds: ["coach-ephraim"],
    startsAt: "2026-09-18T03:00:00.000Z",
    endsAt: "2026-09-18T04:30:00.000Z",
    pricePhp: 550,
    capacity: 12,
    remainingSlots: 12,
    reservable: false,
    availability: "cancelled",
    status: "CANCELLED",
  }),
  session({
    id: "session-sun-alec",
    classId: "class-calisthenics",
    coachIds: ["coach-alec"],
    startsAt: "2026-09-20T03:00:00.000Z",
    endsAt: "2026-09-20T04:30:00.000Z",
    pricePhp: 550,
    capacity: 12,
    remainingSlots: 7,
    reservable: true,
    availability: "open",
    status: "PUBLISHED",
  }),
  session({
    id: "session-sun-dance",
    classId: "class-dance",
    coachIds: ["coach-mikaela"],
    startsAt: "2026-09-20T07:00:00.000Z",
    endsAt: "2026-09-20T08:30:00.000Z",
    pricePhp: 500,
    capacity: 16,
    remainingSlots: 9,
    reservable: true,
    availability: "open",
    status: "PUBLISHED",
  }),
  session({
    id: "session-thu-early",
    classId: "class-yoga",
    coachIds: ["coach-wolf"],
    startsAt: "2026-09-17T00:00:00.000Z",
    endsAt: "2026-09-17T01:30:00.000Z",
    pricePhp: 500,
    capacity: 12,
    remainingSlots: 6,
    reservable: true,
    availability: "open",
    status: "PUBLISHED",
  }),
];

export const customers: CustomerProfile[] = [
  {
    id: "cust-ana",
    fullName: "Ana Delgado",
    email: "ana@example.com",
    contactNumber: "+63 917 000 0001",
    authMethod: "google",
  },
  {
    id: "cust-ben",
    fullName: "Ben Santos",
    email: "ben@example.com",
    contactNumber: "+63 917 000 0002",
    authMethod: "email",
  },
  {
    id: "cust-empty",
    fullName: "Empty Inbox",
    email: "empty@example.com",
    contactNumber: "+63 917 000 0003",
    authMethod: "email",
  },
];

export const policyAcceptances: Record<string, PolicyAcceptance[]> = {
  "cust-ana": [
    { documentName: "Studio waiver", version: "2026-01", acceptedAt: "2026-08-01T02:00:00.000Z" },
  ],
  "cust-ben": [],
};

const QUEUE_GIVEN_NAMES = [
  "Aria",
  "Benito",
  "Celine",
  "Diego",
  "Elena",
  "Felix",
  "Gina",
  "Hiro",
  "Isla",
  "Jonah",
] as const;

const QUEUE_FAMILY_NAMES = ["Cruz", "Reyes", "Santos", "Tan", "Lim"] as const;

/** Display name for a booking customer. Queue-only ids have no profile row. */
export function customerNameFor(customerId: string): string {
  const known = customers.find((row) => row.id === customerId);
  if (known) return known.fullName;
  const generated = /^cust-q-[a-z]+-(\d+)$/.exec(customerId);
  if (generated) {
    const index = Number(generated[1]);
    const given = QUEUE_GIVEN_NAMES[index % QUEUE_GIVEN_NAMES.length] ?? "Aria";
    const family = QUEUE_FAMILY_NAMES[Math.floor(index / 10) % QUEUE_FAMILY_NAMES.length] ?? "Cruz";
    return `${given} ${family}`;
  }
  return "Studio guest";
}

function booking(
  id: string,
  status: BookingStatus,
  sessionId: string,
  extras: Partial<CustomerBooking> = {},
): CustomerBooking {
  const sess = publicSessions.find((s) => s.id === sessionId) ?? publicSessions[2];
  const customerId = extras.customerId ?? "cust-ana";
  return {
    id,
    customerId,
    customerName: extras.customerName ?? customerNameFor(customerId),
    sessionId: sess.id,
    status,
    paymentMethod: extras.paymentMethod ?? null,
    paymentStatus: extras.paymentStatus ?? "NONE",
    refundStatus: extras.refundStatus ?? "NOT_APPLICABLE",
    holdExpiresAt: extras.holdExpiresAt ?? "2026-09-16T10:00:00.000Z",
    createdAt: extras.createdAt ?? "2026-09-15T00:00:00.000Z",
    session: sess,
    ...extras,
  };
}

const sunDance = publicSessions.find((s) => s.id === "session-sun-dance") ?? null;
const satFull = publicSessions.find((s) => s.id === "session-sat-full") ?? null;

/** Off today / off `session-wed-open` so dashboard tiles and that roster stay stable. */
const QUEUE_SESSION_IDS = [
  "session-past-open",
  "session-thu-early",
  "session-fri-cancelled",
  "session-sat-full",
  "session-sun-alec",
  "session-sun-dance",
] as const;

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function queueSessionId(index: number): string {
  return QUEUE_SESSION_IDS[index % QUEUE_SESSION_IDS.length] ?? "session-thu-early";
}

function queueTargetSession(index: number): PublicSession | null {
  const targetId = QUEUE_SESSION_IDS[(index + 1) % QUEUE_SESSION_IDS.length];
  return publicSessions.find((session) => session.id === targetId) ?? null;
}

/**
 * ~120 synthetic queue rows for FE-ADM-020. Distinct sort keys, new customer
 * ids, existing `booking()` helper only. Showcase rows stay untouched.
 */
function buildGeneratedQueueBookings(): CustomerBooking[] {
  const rows: CustomerBooking[] = [];

  for (let index = 0; index < 40; index += 1) {
    const sessionId = queueSessionId(index);
    rows.push(
      booking(`booking-q-cxl-${pad2(index)}`, "CANCELLATION_REQUESTED", sessionId, {
        customerId: `cust-q-cxl-${pad2(index)}`,
        paymentMethod: "GCASH",
        paymentStatus: "VERIFIED",
        cancellationReason:
          index % 5 === 0
            ? "I need to travel for work this week and cannot make the class after all. Please release the slot."
            : "Schedule conflict",
        requestCreatedAt: `2026-09-10T08:${pad2(index)}:00.000Z`,
        createdAt: `2026-09-09T08:${pad2(index)}:00.000Z`,
        holdExpiresAt: null,
      }),
    );
  }

  for (let index = 0; index < 40; index += 1) {
    const sessionId = queueSessionId(index + 2);
    const target = queueTargetSession(index);
    rows.push(
      booking(`booking-q-rs-${pad2(index)}`, "RESCHEDULE_REQUESTED", sessionId, {
        customerId: `cust-q-rs-${pad2(index)}`,
        paymentMethod: "GCASH",
        paymentStatus: "VERIFIED",
        requestCreatedAt: `2026-09-10T10:${pad2(index)}:00.000Z`,
        createdAt: `2026-09-09T10:${pad2(index)}:00.000Z`,
        holdExpiresAt: null,
        targetSessionId: target?.id ?? "session-sun-dance",
        targetSession: target,
      }),
    );
  }

  for (let index = 0; index < 14; index += 1) {
    const sessionId = queueSessionId(index + 1);
    rows.push(
      booking(`booking-q-gcash-${pad2(index)}`, "PAYMENT_SUBMITTED", sessionId, {
        customerId: `cust-q-pay-${pad2(index)}`,
        paymentMethod: "GCASH",
        paymentStatus: "PROOF_SUBMITTED",
        proofPreviewUrl: MOCK_PROOF_PREVIEW_URL,
        createdAt: `2026-09-10T14:${pad2(index)}:00.000Z`,
        holdExpiresAt: `2026-09-18T02:${pad2(index)}:00.000Z`,
      }),
    );
  }

  for (let index = 0; index < 13; index += 1) {
    const sessionId = queueSessionId(index + 3);
    rows.push(
      booking(`booking-q-counter-${pad2(index)}`, "HELD_AWAITING_PAYMENT", sessionId, {
        customerId: `cust-q-pay-${pad2(index + 14)}`,
        paymentMethod: "PAY_AT_COUNTER",
        paymentStatus: "NONE",
        createdAt: `2026-09-10T15:${pad2(index)}:00.000Z`,
        holdExpiresAt: `2026-09-18T04:${pad2(index)}:00.000Z`,
      }),
    );
  }

  for (let index = 0; index < 13; index += 1) {
    const sessionId = queueSessionId(index + 4);
    const refunded = index >= 7;
    rows.push(
      booking(`booking-q-refund-${pad2(index)}`, "CANCELLED", sessionId, {
        customerId: `cust-q-pay-${pad2(index + 27)}`,
        paymentMethod: "GCASH",
        paymentStatus: "VERIFIED",
        refundStatus: refunded ? "REFUNDED" : "REFUND_PENDING",
        createdAt: `2026-09-10T16:${pad2(index)}:00.000Z`,
        holdExpiresAt: null,
      }),
    );
  }

  return rows;
}

export const bookings: CustomerBooking[] = BOOKING_STATUSES.map((status, index) => {
  const extras: Partial<CustomerBooking> = {};
  if (status === "HELD_AWAITING_PAYMENT") {
    extras.paymentMethod = null;
    extras.holdExpiresAt = "2026-09-16T10:00:00.000Z";
  }
  if (status === "PAYMENT_SUBMITTED") {
    extras.paymentMethod = "GCASH";
    extras.paymentStatus = "PROOF_SUBMITTED";
    extras.proofPreviewUrl = MOCK_PROOF_PREVIEW_URL;
  }
  if (
    status === "CONFIRMED" ||
    status === "CHECKED_IN" ||
    status === "COMPLETED" ||
    status === "NO_SHOW"
  ) {
    extras.paymentMethod = "PAY_AT_COUNTER";
    extras.paymentStatus = "VERIFIED";
  }
  if (status === "CANCELLED") {
    extras.refundStatus = "REFUNDED";
    extras.paymentStatus = "VERIFIED";
    extras.paymentMethod = "GCASH";
  }
  if (status === "CANCELLATION_REQUESTED") {
    extras.paymentMethod = "GCASH";
    extras.paymentStatus = "VERIFIED";
    extras.cancellationReason = "Schedule conflict";
    extras.requestCreatedAt = "2026-09-16T01:10:00.000Z";
  }
  if (status === "RESCHEDULE_REQUESTED") {
    extras.paymentMethod = "GCASH";
    extras.paymentStatus = "VERIFIED";
    extras.requestCreatedAt = "2026-09-16T01:20:00.000Z";
    extras.targetSessionId = "session-sun-dance";
    extras.targetSession = sunDance;
  }
  return booking(`booking-${status.toLowerCase()}`, status, "session-wed-open", {
    createdAt: `2026-09-14T0${Math.min(index, 9)}:00:00.000Z`,
    ...extras,
  });
}).concat([
  booking("booking-refund-pending", "CANCELLED", "session-wed-nearly", {
    id: "booking-refund-pending",
    refundStatus: "REFUND_PENDING",
    paymentMethod: "GCASH",
    paymentStatus: "VERIFIED",
    customerId: "cust-ben",
  }),
  booking("booking-hold-capped", "HELD_AWAITING_PAYMENT", "session-thu-early", {
    id: "booking-hold-capped",
    customerId: "cust-ana",
    createdAt: "2026-09-16T17:00:00.000Z",
    holdExpiresAt: "2026-09-17T01:00:00.000Z",
  }),
  booking("booking-reschedule-full", "RESCHEDULE_REQUESTED", "session-wed-nearly", {
    id: "booking-reschedule-full",
    customerId: "cust-ben",
    paymentMethod: "GCASH",
    paymentStatus: "VERIFIED",
    requestCreatedAt: "2026-09-16T01:30:00.000Z",
    targetSessionId: "session-sat-full",
    targetSession: satFull,
  }),
  booking("booking-counter-held", "HELD_AWAITING_PAYMENT", "session-wed-nearly", {
    id: "booking-counter-held",
    customerId: "cust-ben",
    paymentMethod: "PAY_AT_COUNTER",
    paymentStatus: "NONE",
  }),
  ...buildGeneratedQueueBookings(),
]);

export const adminSessions: AdminSession[] = publicSessions.map((row) => {
  const coachAssignments = row.coaches.map((coach) => {
    const source = adminCoaches.find((c) => c.id === coach.id);
    if (!source) throw new Error(`Unknown fixture coach: ${coach.id}`);
    return { coachId: source.id, ...snapshotRateFromCoach(source) };
  });
  return {
    ...row,
    bookable: row.reservable,
    coachAssignments,
    coachRatePhp: coachAssignments.reduce(
      (sum, assignment) => sum + sessionCoachCost(assignment, row),
      0,
    ),
  };
});

export const paymentInstructions: PaymentInstructions = {
  gcashName: "Balansé Wellness Hub (placeholder)",
  gcashNumber: "0968 220 9198",
  qrImageKey: null,
  notes: "Placeholder GCash details for mocked screens. Not a live payment destination.",
};

export const publicContent: PublicContent = {
  about:
    "At Balansé, we promote holistic wellness by combining movement, fitness education, recovery, and tranquility.",
  contact: {
    phone: "+63 968 220 9198",
    email: "balanse.wellnesshub@gmail.com",
    address: "Unit 2A, Capitol Centrum Building, N Escario, Cebu City, 6000",
  },
  faqs: flattenFaqs(),
};

export const adminClasses: AdminClass[] = [
  ...publicClasses,
  {
    id: "class-open-studio",
    slug: "open-studio",
    description: "",
    coachIds: [],
    heroImage: null,
    galleryImages: [],
    name: "Open Studio",
    shortDescription:
      "Unstructured floor time with session-level duration and price. This longer description exercises truncation on the catalogue table.",
    defaultDurationMinutes: null,
    defaultPricePhp: null,
    active: false,
  },
];

export const adminSettings: AdminSettings = {
  ...publicContent,
  ...paymentInstructions,
  paymentQrs: [],
  businessName: "Balansé Wellness Hub",
  openingHours: "",
  policyDocuments: [
    {
      id: "policy-waiver-2026-01",
      documentName: "Waiver",
      version: "2026-01",
      promotedAt: "2026-01-15T00:00:00.000Z",
      current: true,
      body: "Please review the studio waiver before attending your first session.",
    },
    {
      id: "policy-gym-2026-01",
      documentName: "Gym Policy",
      version: "2026-01",
      promotedAt: "2026-01-15T00:00:00.000Z",
      current: true,
      body: "Please follow studio etiquette, safety guidance, and instructor direction during every class.",
    },
  ],
};

export const staff: AdminStaff[] = [
  {
    id: "staff-rex",
    name: "Rex Francis Regis",
    email: "rex@balanse.example",
    role: "ADMIN",
    status: "active",
    isCoach: true,
    coachId: "coach-rex",
  },
  {
    id: "staff-partner",
    name: "Studio Partner",
    email: "partner@balanse.example",
    role: "ADMIN",
    status: "active",
    isCoach: false,
    coachId: null,
  },
];
