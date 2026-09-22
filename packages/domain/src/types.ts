import type {
  BookingStatus,
  CoachRateType,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  SessionStatus,
  StaffRole,
} from "./enums";

export type PublicClass = {
  id: string;
  name: string;
  slug: string;
  customPageUrl?: string | null;
  shortDescription: string;
  /** Safe Markdown subset; rendered as React nodes, never raw HTML. */
  description: string;
  /** Optional marketing roster. Session assignments remain independently required. */
  coachIds: string[];
  heroImage: string | null;
  galleryImages: string[];
  defaultDurationMinutes: number | null;
  defaultPricePhp: number | null;
  active: boolean;
};

export type PublicCoach = {
  id: string;
  name: string;
  specialties: string[];
  shortBio: string;
  photoKey: string | null;
  active: boolean;
};

/** Admin-only. Never assign this type to public/customer fixture shapes. */
export type AdminCoach = PublicCoach & {
  defaultRatePhp: number;
  rateType: CoachRateType;
  /** BE-055 — linked `StaffMember.id`, or `null` when the coach is teaching-only. */
  staffId: string | null;
};

export type PublicSession = {
  id: string;
  /** Optional occurrence title. Empty means use the class name. */
  name?: string | null;
  classId: string;
  className: string;
  coaches: Pick<PublicCoach, "id" | "name" | "photoKey">[];
  /** Derived display label for all assigned coaches. */
  coachName: string;
  startsAt: string;
  endsAt: string;
  pricePhp: number;
  capacity: number;
  remainingSlots: number;
  reservable: boolean;
  availability:
    | "open"
    | "nearly_full"
    | "full_with_waitlist"
    | "past"
    | "cancelled"
    | "past_cutoff";
  status: SessionStatus;
};

export type PublicContent = {
  about: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  faqs: { id: string; question: string; answer: string; sortOrder?: number }[];
};

export type CustomerProfile = {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  authMethod: "email" | "google";
};

export type PolicyAcceptance = {
  documentName: string;
  version: string;
  acceptedAt: string;
};

export type CustomerBooking = {
  id: string;
  customerId: string;
  /** Display name only — same field BE-050 already returns on queue rows. */
  customerName: string;
  sessionId: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  refundStatus: RefundStatus;
  holdExpiresAt: string | null;
  createdAt: string;
  session: PublicSession;
  cancellationReason?: string | null;
  requestCreatedAt?: string | null;
  targetSessionId?: string | null;
  targetSession?: PublicSession | null;
  rejectReason?: string | null;
  proofPreviewUrl?: string | null;
  /** Held or consumed package redemption, when the booking used a package. */
  entitlementId?: string | null;
  /** Waitlist intent only — does not hold or consume a credit. */
  intendedEntitlementId?: string | null;
  packageName?: string | null;
  /** True when waitlist promotion could not reserve the intended package. */
  packagePromotionBlocked?: boolean;
};

export type PaymentInstructions = {
  gcashName: string;
  gcashNumber: string;
  /** Derived from the active `PaymentQrCode.imageKey` (BE-056). Read-only on writes. */
  qrImageKey: string | null;
  notes: string;
};

/** Admin receive-QR row (BE-056 / FE-ADM-040). */
export type PaymentQrCode = {
  id: string;
  label: string;
  imageKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export type AdminStaff = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: "active" | "disabled";
  /** Derived from a linked Coach row (BE-055). Not a StaffRole value. */
  isCoach: boolean;
  coachId: string | null;
};

export type AdminCustomer = CustomerProfile & {
  bookingCount: number;
  upcomingCount: number;
  lastVisitAt: string | null;
};
