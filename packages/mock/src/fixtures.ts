import type {
  AdminCoach,
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
import { BOOKING_STATUSES, coachPhotoKey, flattenFaqs, teachesBio } from "@balanse/domain";

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
];

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
  },
];

export const adminCoaches: AdminCoach[] = coachRows;

export function toPublicCoach(coach: AdminCoach): PublicCoach {
  const { defaultRatePhp: _rate, rateType: _type, ...publicCoach } = coach;
  return publicCoach;
}

export const publicCoaches: PublicCoach[] = coachRows.map(toPublicCoach);

function session(
  partial: Omit<PublicSession, "className" | "coachName"> & {
    className?: string;
    coachName?: string;
  },
): PublicSession {
  const cls = publicClasses.find((c) => c.id === partial.classId);
  const coach = publicCoaches.find((c) => c.id === partial.coachId);
  return {
    ...partial,
    className: partial.className ?? cls?.name ?? "Class",
    coachName: partial.coachName ?? coach?.name ?? "Coach",
  };
}

export const publicSessions: PublicSession[] = [
  session({
    id: "session-past-open",
    classId: "class-calisthenics",
    coachId: "coach-rex",
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
    coachId: "coach-rex",
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
    coachId: "coach-rex",
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
    coachId: "coach-wolf",
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
    coachId: "coach-rachelle",
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
    coachId: "coach-ephraim",
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
    id: "session-sun-dance",
    classId: "class-dance",
    coachId: "coach-mikaela",
    startsAt: "2026-09-20T07:00:00.000Z",
    endsAt: "2026-09-20T08:30:00.000Z",
    pricePhp: 500,
    capacity: 16,
    remainingSlots: 9,
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
];

export const policyAcceptances: Record<string, PolicyAcceptance[]> = {
  "cust-ana": [
    { documentName: "Studio waiver", version: "2026-01", acceptedAt: "2026-08-01T02:00:00.000Z" },
  ],
  "cust-ben": [],
};

function booking(
  id: string,
  status: BookingStatus,
  sessionId: string,
  extras: Partial<CustomerBooking> = {},
): CustomerBooking {
  const sess = publicSessions.find((s) => s.id === sessionId) ?? publicSessions[2];
  return {
    id,
    customerId: extras.customerId ?? "cust-ana",
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

export const bookings: CustomerBooking[] = BOOKING_STATUSES.map((status, index) => {
  const extras: Partial<CustomerBooking> = {};
  if (status === "HELD_AWAITING_PAYMENT") {
    extras.paymentMethod = null;
    extras.holdExpiresAt = "2026-09-16T10:00:00.000Z";
  }
  if (status === "PAYMENT_SUBMITTED") {
    extras.paymentMethod = "GCASH";
    extras.paymentStatus = "PROOF_SUBMITTED";
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
]);

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

export const staff: AdminStaff[] = [
  {
    id: "staff-rex",
    name: "Rex Francis Regis",
    email: "rex@balanse.example",
    role: "ADMIN",
    status: "active",
  },
  {
    id: "staff-partner",
    name: "Studio Partner",
    email: "partner@balanse.example",
    role: "ADMIN",
    status: "active",
  },
];
