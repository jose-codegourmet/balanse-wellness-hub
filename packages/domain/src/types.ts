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
  shortDescription: string;
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
};

export type PublicSession = {
  id: string;
  classId: string;
  className: string;
  coachId: string;
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
  faqs: { id: string; question: string; answer: string }[];
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
  sessionId: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  refundStatus: RefundStatus;
  holdExpiresAt: string | null;
  createdAt: string;
  session: PublicSession;
};

export type PaymentInstructions = {
  gcashName: string;
  gcashNumber: string;
  qrImageKey: string | null;
  notes: string;
};

export type AdminStaff = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: "active" | "disabled";
};

export type AdminCustomer = CustomerProfile & {
  bookingCount: number;
};
