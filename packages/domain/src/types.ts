import type {
  BookingStatus,
  CoachRateType,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  SessionStatus,
  StaffRole,
} from "./enums";
import type { OnboardingStatus } from "./onboarding";
import type { CustomerPolicyForm } from "./policy-forms";

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
  firstName: string;
  /** Required on write; may be empty for legacy single-word names until the customer completes it. */
  lastName: string;
  /**
   * @deprecated Derived `${firstName} ${lastName}`. Kept so existing readers compile;
   * write `firstName` / `lastName` instead.
   */
  fullName: string;
  /** Optional public display name. Display = nickname, else first name. */
  nickname: string | null;
  /** Resolved avatar URL (mock: data URL or placeholder asset). `null` → initials. */
  avatarUrl: string | null;
  /** When false the customer is counted but not listed on public rosters. */
  showOnPublicRoster: boolean;
  /** Code carried by links this customer shares (`?ref=`). */
  referralCode: string;
  onboardingStatus: OnboardingStatus;
  email: string;
  contactNumber: string;
  authMethod: "email" | "google";
};

/** Fields a customer may change on their own profile. */
export type CustomerProfilePatch = Partial<
  Pick<
    CustomerProfile,
    "firstName" | "lastName" | "nickname" | "email" | "contactNumber" | "showOnPublicRoster"
  >
>;

export type PolicyAcceptance = {
  documentName: string;
  version: string;
  acceptedAt: string;
  /** Customer form the acceptance was captured on, when known. */
  form?: CustomerPolicyForm;
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
  redemption?: {
    id: string;
    status: import("./enums").BundleRedemptionStatus;
    entitlementId: string;
  } | null;
};

export const PAYMENT_ACCOUNT_TYPES = ["GCASH", "MAYA", "QRPH"] as const;
export type PaymentAccountType = (typeof PAYMENT_ACCOUNT_TYPES)[number];

/** What a customer sees for one payment account at checkout. */
export type PaymentAccountSummary = {
  id: string;
  type: PaymentAccountType;
  label: string;
  accountName: string;
  /** GCash / Maya mobile number, or the account number behind a QR Ph code. */
  accountNumber: string;
  imageKey: string | null;
};

export type PaymentInstructions = {
  /** Derived from the first account shown to customers. Kept for legacy readers. */
  gcashName: string;
  gcashNumber: string;
  /** Derived from the first shown account with a QR (BE-056). Read-only on writes. */
  qrImageKey: string | null;
  notes: string;
  /** Every payment account currently shown to customers, in admin order. */
  accounts: PaymentAccountSummary[];
};

/**
 * Admin payment account (BE-056 / FE-ADM-040): a receive QR and/or account
 * details for GCash, Maya, or QR Ph. Several can be shown to customers at once.
 */
export type PaymentQrCode = PaymentAccountSummary & {
  /** Shown to customers at checkout. */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export type AdminStaff = {
  id: string;
  name: string;
  email: string;
  /** Legacy enum until the leftover StaffRole column is dropped. Not authorization truth. */
  role: StaffRole;
  /** Assigned StaffRoleDefinition id. Authorization truth with `roleKey`. */
  roleId: string;
  roleKey: string;
  roleName: string;
  status: "active" | "disabled";
  /** Derived from a linked Coach row (BE-055). Not an authorization role. */
  isCoach: boolean;
  coachId: string | null;
};

export type AdminCustomer = CustomerProfile & {
  bookingCount: number;
  upcomingCount: number;
  lastVisitAt: string | null;
};

/** Identity shown next to a booking on admin rosters. */
export type AdminRosterPerson = {
  customerId: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  avatarUrl: string | null;
  showOnPublicRoster: boolean;
  /** `null` when the viewer may not see onboarding answers, or none exist. */
  onboarding: import("./onboarding").CustomerOnboardingAnswers | null;
};

export type CustomerReferralSummary = {
  referredBy: { id: string; fullName: string } | null;
  channel: import("./onboarding").ReferralChannel | null;
  referrals: { id: string; fullName: string }[];
};
