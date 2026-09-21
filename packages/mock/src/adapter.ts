import type {
  AdminClass,
  AdminCoach,
  AdminCustomer,
  AdminCustomerDetail,
  AdminDashboardSnapshot,
  AdminPaymentTab,
  AdminReportFilters,
  AdminReports,
  AdminSession,
  AdminSettings,
  AdminStaff,
  BookingStatus,
  CursorPage,
  CustomerBooking,
  CustomerProfile,
  PaymentInstructions,
  PaymentMethod,
  PaymentQrCode,
  PolicyAcceptance,
  PublicClass,
  PublicCoach,
  PublicContent,
  PublicSession,
  SessionReportDrilldown,
  SessionStatus,
} from "@balanse/domain";

export type AdminPaymentQueueQuery = {
  tab?: AdminPaymentTab;
  limit?: number;
  cursor?: string;
};

export type AdminRequestQueueQuery = {
  limit?: number;
  cursor?: string;
};

/**
 * Method names mirror §4.3 API route inventory so WIRE-001 is a mechanical swap.
 * Screens must import this interface (or `getMockAdapter()`), never fixture files.
 */
export type MockDataAdapter = {
  getPublicSessions: (query?: { from?: string; to?: string }) => Promise<PublicSession[]>;
  getPublicSession: (id: string) => Promise<PublicSession | null>;
  getPublicCoaches: () => Promise<PublicCoach[]>;
  getPublicClasses: () => Promise<PublicClass[]>;
  getPublicContent: () => Promise<PublicContent>;

  getMe: (customerId: string) => Promise<CustomerProfile | null>;
  patchMe: (
    customerId: string,
    patch: Partial<Pick<CustomerProfile, "fullName" | "email" | "contactNumber">>,
  ) => Promise<CustomerProfile>;
  getMePolicyAcceptances: (customerId: string) => Promise<PolicyAcceptance[]>;
  createCustomer: (input: {
    fullName: string;
    email: string;
    contactNumber: string;
  }) => Promise<CustomerProfile>;

  createBooking: (input: {
    customerId: string;
    sessionId: string;
    policyAcceptances?: PolicyAcceptance[];
  }) => Promise<CustomerBooking>;
  getBookings: (customerId: string) => Promise<CustomerBooking[]>;
  getBooking: (id: string) => Promise<CustomerBooking | null>;
  joinWaitlist: (bookingId: string) => Promise<CustomerBooking>;
  setPaymentMethod: (bookingId: string, method: PaymentMethod) => Promise<CustomerBooking>;
  uploadPaymentProof: (bookingId: string) => Promise<CustomerBooking>;
  getPaymentInstructions: () => Promise<PaymentInstructions>;
  createCancellationRequest: (bookingId: string, reason?: string) => Promise<CustomerBooking>;
  createRescheduleRequest: (bookingId: string, targetSessionId: string) => Promise<CustomerBooking>;

  getAdminBookings: (filters?: {
    status?: BookingStatus;
    query?: string;
    classId?: string;
    date?: string;
  }) => Promise<CustomerBooking[]>;
  confirmAdminBooking: (id: string) => Promise<CustomerBooking>;
  rejectAdminBooking: (id: string, reason: string) => Promise<CustomerBooking>;
  getAdminPayments: {
    (): Promise<CustomerBooking[]>;
    (query: AdminPaymentQueueQuery): Promise<CursorPage<CustomerBooking>>;
  };
  recordCash: (bookingId: string) => Promise<CustomerBooking>;
  markRefundPending: (bookingId: string) => Promise<CustomerBooking>;
  markRefunded: (bookingId: string) => Promise<CustomerBooking>;
  getAdminPaymentProofSignedUrl: (bookingId: string) => Promise<{ url: string }>;
  getAdminClasses: () => Promise<AdminClass[]>;
  upsertAdminClass: (input: {
    id?: string;
    name: string;
    shortDescription: string;
    defaultDurationMinutes: number | null;
    defaultPricePhp: number | null;
    active: boolean;
    associatedCoachIds: string[];
  }) => Promise<AdminClass>;
  getAdminCoaches: () => Promise<AdminCoach[]>;
  upsertAdminCoach: (input: {
    id?: string;
    name: string;
    specialties: string[];
    shortBio: string;
    photoKey: string | null;
    active: boolean;
    defaultRatePhp: number;
    rateType: AdminCoach["rateType"];
  }) => Promise<AdminCoach>;
  getAdminSessions: () => Promise<AdminSession[]>;
  upsertAdminSession: (input: {
    id?: string;
    classId: string;
    coachId: string;
    startsAt: string;
    endsAt: string;
    pricePhp: number;
    capacity: number;
    bookable: boolean;
    status: SessionStatus;
    coachRatePhp: number;
    coachRateType: AdminSession["coachRateType"];
  }) => Promise<AdminSession>;
  cancelAdminSession: (id: string) => Promise<AdminSession>;
  getAdminCancellationRequests: {
    (): Promise<CustomerBooking[]>;
    (query: AdminRequestQueueQuery): Promise<CursorPage<CustomerBooking>>;
  };
  completeAdminCancellation: (bookingId: string) => Promise<CustomerBooking>;
  rejectAdminCancellation: (bookingId: string, reason: string) => Promise<CustomerBooking>;
  getAdminRescheduleRequests: {
    (): Promise<CustomerBooking[]>;
    (query: AdminRequestQueueQuery): Promise<CursorPage<CustomerBooking>>;
  };
  approveAdminReschedule: (bookingId: string) => Promise<CustomerBooking>;
  rejectAdminReschedule: (bookingId: string, reason: string) => Promise<CustomerBooking>;
  getAdminSessionRoster: (sessionId: string) => Promise<{
    session: AdminSession;
    confirmed: CustomerBooking[];
    held: CustomerBooking[];
    waitlisted: CustomerBooking[];
    capacity: number;
    confirmedCount: number;
    heldCount: number;
    available: number;
    waitlistedCount: number;
    checkedIn: number;
    noShow: number;
    occupancy: number;
    attendanceUtilisation: number;
  }>;
  checkIn: (bookingId: string) => Promise<CustomerBooking>;
  markNoShow: (bookingId: string) => Promise<CustomerBooking>;
  getAdminReportsSales: () => Promise<{ grossPhp: number; refundsPhp: number; netPhp: number }>;
  getAdminReports: (filters: AdminReportFilters) => Promise<AdminReports>;
  getAdminSessionReport: (sessionId: string) => Promise<SessionReportDrilldown | null>;
  getAdminStaff: () => Promise<AdminStaff[]>;
  upsertAdminStaff: (input: {
    id?: string;
    name: string;
    email: string;
    role: AdminStaff["role"];
    status: AdminStaff["status"];
    /** Capability flag. Setting it links/creates a coach; clearing unlinks and deactivates. */
    isCoach?: boolean;
  }) => Promise<AdminStaff>;
  disableAdminStaff: (id: string) => Promise<AdminStaff>;
  getAdminCustomers: (filters?: {
    query?: string;
    hasUpcoming?: boolean;
  }) => Promise<AdminCustomer[]>;
  getAdminCustomer: (id: string) => Promise<AdminCustomerDetail | null>;
  getAdminSettings: () => Promise<AdminSettings>;
  updateAdminSettings: (patch: Partial<AdminSettings>) => Promise<AdminSettings>;
  listPaymentQrs: (includeArchived?: boolean) => Promise<{
    items: PaymentQrCode[];
    activeId: string | null;
  }>;
  upsertPaymentQr: (input: {
    id?: string;
    label: string;
    imageKey: string;
  }) => Promise<PaymentQrCode>;
  activatePaymentQr: (id: string) => Promise<PaymentQrCode>;
  archivePaymentQr: (id: string) => Promise<PaymentQrCode>;
  promotePolicyVersion: (documentName: string, version: string) => Promise<AdminSettings>;
  getAdminDashboard: () => Promise<AdminDashboardSnapshot>;
};

export type MockRuntimeOptions = {
  latencyMs: number;
  failNext: boolean;
  /** Sticky calendar load failure for FE-SHR-003 / FE-SHR-005. */
  failPublicSessions: boolean;
  /** When set, that session reports as full (session-became-full demo). */
  sessionBecameFullId: string | null;
  /** Sticky GCash proof upload failure for FE-CUS-010. */
  failProofUpload: boolean;
  /** Empty admin queues for FE-ADM empty-state demos. */
  emptyAdminQueues: boolean;
};

export const defaultMockRuntime: MockRuntimeOptions = {
  latencyMs: 0,
  failNext: false,
  failPublicSessions: false,
  sessionBecameFullId: null,
  failProofUpload: false,
  emptyAdminQueues: false,
};
