/**
 * HTTP request/response envelope types for handlers that don't already export
 * one (#355 WIRE-0104). `AdminEvent*`, `CursorPage`, `ValidationFailedBody`,
 * `EVENT_CONFLICT_CODES` and the bundle `Http*` types stay in `contracts.ts`
 * and `bundles.ts` respectively — this file only adds what was missing:
 * booking, session roster, admin settings, and admin customer list/detail.
 */

import type { HttpBundleAcquisition, HttpCustomerEntitlement } from "./bundles";
import type { BookingStatus, PaymentMethod, PaymentStatus, RefundStatus } from "./enums";

/** Mirrors Prisma's `RequestResolution` (`request_resolution`), not re-exported from `./enums`. */
export type RequestResolution = "OPEN" | "COMPLETED" | "REJECTED";

export type HttpSessionCoachSummary = {
  id: string;
  name: string;
  photoKey: string | null;
};

/** `presentBooking` in `packages/api/src/handlers/bookings.ts`. */
export type HttpBooking = {
  id: string;
  sessionId: string;
  bookingReference: string;
  holdExpiresAt: string | null;
  reservedAt: string;
  paymentMethod: PaymentMethod | null;
  payment: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: string;
  } | null;
  refund: {
    id: string;
    status: RefundStatus;
    amount: string;
  } | null;
  listTab: "upcoming" | "pending" | "history";
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    className: string;
    coachName: string;
    coaches: HttpSessionCoachSummary[];
    customerPrice: string;
  };
  status: BookingStatus;
  statusLabel: string;
  statusLabelKey: BookingStatus;
  surfaceLabel: string;
};

/** `getSessionRoster` in `packages/api/src/handlers/admin-roster.ts`, after `shapeRoster`. */
export type HttpRosterAttendee = {
  bookingId: string;
  name: string;
  /** Stripped when the actor lacks `payments.read`. */
  payment?: {
    method: PaymentMethod;
    status: PaymentStatus | null;
    label: string;
  };
  attendance: string;
};

export type HttpRosterWaitlistEntry = {
  id: string;
  name: string;
  sequence: number;
  joinedAt: string;
};

export type HttpRosterMetrics = {
  Capacity: number;
  Confirmed: number;
  Held: number;
  Available: number;
  Waitlisted: number;
  "Checked In": number;
  "No-show": number;
  Occupancy: number;
  "Attendance Utilisation": number;
};

export type HttpSessionRoster = {
  session: {
    id: string;
    className: string;
    coachName: string;
    coaches: HttpSessionCoachSummary[];
    startsAt: string;
  };
  confirmed: HttpRosterAttendee[];
  held: HttpRosterAttendee[];
  waitlist: HttpRosterWaitlistEntry[];
  metrics: HttpRosterMetrics;
};

/** `settingsPayload` in `packages/api/src/handlers/admin-settings.ts`, after `shapeSettingsPayload`. */
export type HttpAdminSettingsPayload = {
  section: {
    business: string[];
    payment: string[];
    content: string[];
    policies: string[];
  };
  /** Dropped when the actor lacks the business-section permission. */
  business?: {
    name: string;
    phone: string;
    address: string;
    openingHours: string;
  };
  /** Dropped when the actor lacks the payment-section permission. */
  payment?: {
    gcashAccountName: string;
    gcashNumber: string;
    gcashQrObjectKey: string;
    qrImageKey: string | null;
    qrs: unknown[];
  };
  /** Dropped when the actor lacks the content-section permission. */
  content?: {
    about: string;
    email: string;
    faqs: Array<{ id: string; question: string; answer: string; sortOrder: number }>;
  };
  /** Dropped when the actor lacks the policies-section permission. */
  policies?: Array<{
    id: string;
    slug: string;
    title: string;
    kind: string;
    required: boolean;
    current: HttpPolicyVersion | null;
    versions: HttpPolicyVersion[];
  }>;
};

export type HttpPolicyVersion = {
  id: string;
  version: string;
  isCurrent: boolean;
  isPlaceholder: boolean;
  effectiveFrom: string;
};

/** `getCustomers` in `packages/api/src/handlers/admin-people.ts`. */
export type HttpAdminCustomerListItem = {
  id: string;
  name: string;
  contact: string;
  upcoming: string | null;
  lastVisit: string | null;
};

export type HttpAdminCustomerList = {
  page: number;
  pageSize: number;
  total: number;
  items: HttpAdminCustomerListItem[];
};

export type HttpCancellationRequest = {
  id: string;
  bookingId: string;
  requesterId: string;
  reason: string;
  requestedAt: string;
  resolution: RequestResolution;
  resolverId: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
};

export type HttpRescheduleRequest = {
  id: string;
  bookingId: string;
  requesterId: string;
  fromSessionId: string;
  targetSessionId: string | null;
  preferenceNote: string | null;
  requestedAt: string;
  resolution: RequestResolution;
  resolverId: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
};

export type HttpBookingSummary = {
  id: string;
  startsAt: string;
  className: string;
  status: BookingStatus;
  statusLabel: string;
  statusLabelKey: BookingStatus;
  surfaceLabel: string;
};

/** `getCustomer` in `packages/api/src/handlers/admin-people.ts`. */
export type HttpAdminCustomerDetail = {
  policy: string;
  profile: {
    id: string;
    fullName: string;
    email: string;
    contactNumber: string;
  };
  upcomingPendingHistory: {
    upcoming: HttpBookingSummary[];
    pending: HttpBookingSummary[];
    history: HttpBookingSummary[];
  };
  cancellationRescheduleHistory: {
    cancellations: HttpCancellationRequest[];
    reschedules: HttpRescheduleRequest[];
  };
  attendanceNoShowHistory: Array<{
    bookingId: string;
    status: BookingStatus;
    at: string | null;
  }>;
  /** `payments`/`refunds` are each `[]` when the actor lacks the matching read permission. */
  paymentRefundHistory: {
    payments: unknown[];
    refunds: unknown[];
  };
  acceptedPolicyVersions: Array<{
    documentName: string;
    version: string;
    acceptedAt: string;
  }>;
  entitlements: HttpCustomerEntitlement[];
  pendingAcquisitions: HttpBundleAcquisition[];
};
