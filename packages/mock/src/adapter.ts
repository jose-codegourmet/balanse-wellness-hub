import type {
  AdminClass,
  AdminCoach,
  AdminCustomer,
  AdminCustomerDetail,
  AdminDashboardSnapshot,
  AdminEvent,
  AdminPaymentTab,
  AdminReportFilters,
  AdminReports,
  AdminSession,
  AdminSettings,
  AdminStaff,
  AdminStaffRole,
  BookingStatus,
  BundleAcquisition,
  BundleAuditEvent,
  BundleDefinition,
  BundleRedemption,
  BundleStatus,
  CursorPage,
  CustomerBooking,
  CustomerEntitlement,
  CustomerProfile,
  DuplicateScheduleInput,
  EventStatus,
  PaymentInstructions,
  PaymentMethod,
  PaymentQrCode,
  PermissionKey,
  PolicyAcceptance,
  PolicyDocumentVersion,
  PublicBundle,
  PublicClass,
  PublicCoach,
  PublicContent,
  PublicSession,
  RecurringScheduleInput,
  ScheduleGenerationResult,
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
  getPublicBundles: () => Promise<PublicBundle[]>;
  getPublicBundle: (slugOrId: string) => Promise<PublicBundle | null>;

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

  getMyEntitlements: (customerId: string) => Promise<CustomerEntitlement[]>;
  getMyEntitlement: (
    customerId: string,
    entitlementId: string,
  ) => Promise<CustomerEntitlement | null>;
  getMyAcquisitions: (customerId: string) => Promise<BundleAcquisition[]>;
  getEligibleEntitlements: (
    customerId: string,
    sessionId: string,
  ) => Promise<CustomerEntitlement[]>;
  getEntitlementRedemptions: (
    customerId: string,
    entitlementId: string,
  ) => Promise<BundleRedemption[]>;
  claimFreeBundle: (input: {
    customerId: string;
    bundleId: string;
    idempotencyKey?: string;
  }) => Promise<CustomerEntitlement>;
  requestPaidBundle: (input: {
    customerId: string;
    bundleId: string;
    idempotencyKey?: string;
  }) => Promise<BundleAcquisition>;
  createBooking: (input: {
    customerId: string;
    sessionId: string;
    policyAcceptances?: PolicyAcceptance[];
    entitlementId?: string | null;
    intendedEntitlementId?: string | null;
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
    slug: string;
    customPageUrl?: string | null;
    description: string;
    coachIds: string[];
    heroImage: string | null;
    galleryImages: string[];
    shortDescription: string;
    defaultDurationMinutes: number | null;
    defaultPricePhp: number | null;
    active: boolean;
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
    name?: string | null;
    coachIds: string[];
    startsAt: string;
    endsAt: string;
    pricePhp: number;
    capacity: number;
    bookable: boolean;
    status: SessionStatus;
  }) => Promise<AdminSession>;
  duplicateAdminSchedule: (input: DuplicateScheduleInput) => Promise<ScheduleGenerationResult>;
  createAdminRecurringSchedule: (
    input: RecurringScheduleInput,
  ) => Promise<ScheduleGenerationResult>;
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
    roleId: string;
    status: AdminStaff["status"];
    /** Capability flag. Setting it links/creates a coach; clearing unlinks and deactivates. */
    isCoach?: boolean;
  }) => Promise<AdminStaff>;
  disableAdminStaff: (id: string) => Promise<AdminStaff>;
  getAdminStaffRoles: () => Promise<AdminStaffRole[]>;
  getAdminStaffRole: (id: string) => Promise<AdminStaffRole | null>;
  upsertAdminStaffRole: (input: {
    id?: string;
    name: string;
    description: string;
    permissionKeys: readonly PermissionKey[];
    cloneSourceId?: string | null;
  }) => Promise<AdminStaffRole>;
  archiveAdminStaffRole: (id: string) => Promise<AdminStaffRole>;
  getAdminCustomers: (filters?: {
    query?: string;
    hasUpcoming?: boolean;
  }) => Promise<AdminCustomer[]>;
  getAdminCustomer: (id: string) => Promise<AdminCustomerDetail | null>;
  getAdminSettings: () => Promise<AdminSettings>;
  upsertPolicyDocument: (input: {
    id?: string;
    documentName: string;
    version: string;
    body: string;
    current?: boolean;
  }) => Promise<PolicyDocumentVersion>;
  deletePolicyDocument: (id: string) => Promise<AdminSettings>;
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
  getAdminEvents: (query?: {
    status?: EventStatus;
    sessionId?: string;
    from?: string;
    to?: string;
    search?: string;
  }) => Promise<AdminEvent[]>;
  getAdminEvent: (id: string) => Promise<AdminEvent | null>;
  getAdminEventForSession: (sessionId: string) => Promise<AdminEvent | null>;
  createAdminEvent: (input: {
    sessionId: string;
    title: string;
    summary?: string;
    description?: string;
    posterImage?: string | null;
    galleryImages?: string[];
    venueName?: string;
    venueAddress?: string;
    beneficiary?: string;
    whatToBring?: string;
    internalNotes?: string;
    registrationOpensAt?: string | null;
    registrationClosesAt?: string | null;
  }) => Promise<AdminEvent>;
  updateAdminEvent: (
    id: string,
    patch: {
      title?: string;
      summary?: string;
      description?: string;
      posterImage?: string | null;
      galleryImages?: string[];
      venueName?: string;
      venueAddress?: string;
      beneficiary?: string;
      whatToBring?: string;
      internalNotes?: string;
      registrationOpensAt?: string | null;
      registrationClosesAt?: string | null;
    },
  ) => Promise<AdminEvent>;
  publishAdminEvent: (id: string) => Promise<AdminEvent>;
  cancelAdminEvent: (id: string) => Promise<AdminEvent>;
  archiveAdminEvent: (id: string) => Promise<AdminEvent>;
  getAdminBundles: () => Promise<BundleDefinition[]>;
  getAdminBundle: (id: string) => Promise<BundleDefinition | null>;
  upsertAdminBundle: (input: {
    id?: string;
    name: string;
    slug: string;
    summary: string;
    description: string;
    sessionCredits: number;
    pricePhp: number;
    allActiveClasses: boolean;
    classIds: string[];
    validityDays: number | null;
    perCustomerLimit: number | null;
    status: BundleStatus;
  }) => Promise<BundleDefinition>;
  setAdminBundleStatus: (id: string, status: BundleStatus) => Promise<BundleDefinition>;
  grantCustomerBundle: (input: {
    customerId: string;
    bundleId: string;
    note?: string;
    overrideLimit?: boolean;
    actorId?: string;
    idempotencyKey?: string;
  }) => Promise<CustomerEntitlement>;
  revokeCustomerEntitlement: (input: {
    entitlementId: string;
    reason: string;
    actorId?: string;
  }) => Promise<CustomerEntitlement>;
  getAdminBundleAcquisitions: (
    status?: BundleAcquisition["status"],
  ) => Promise<BundleAcquisition[]>;
  approveBundleAcquisition: (id: string, actorId?: string) => Promise<CustomerEntitlement>;
  rejectBundleAcquisition: (
    id: string,
    reason: string,
    actorId?: string,
  ) => Promise<BundleAcquisition>;
  getAdminCustomerEntitlements: (customerId: string) => Promise<CustomerEntitlement[]>;
  getBundleAudit: (query?: {
    entitlementId?: string;
    customerId?: string;
    bundleId?: string;
  }) => Promise<BundleAuditEvent[]>;
  expireHeldBooking: (bookingId: string) => Promise<CustomerBooking>;
  promoteWaitlistedBooking: (bookingId: string) => Promise<CustomerBooking>;
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
