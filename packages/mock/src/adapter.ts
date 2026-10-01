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
  AdminRosterPerson,
  AdminSession,
  AdminSettings,
  AdminStaff,
  AdminStaffRole,
  AdminVenue,
  BookingStatus,
  BundleAcquisition,
  BundleAuditEvent,
  BundleCreditMetrics,
  BundleDefinition,
  BundleRedemption,
  BundleStatus,
  ClassChangeRequest,
  CoachStudent,
  CoachStudentDetail,
  CreateClassChangeRequestInput,
  CursorPage,
  CustomerBooking,
  CustomerEntitlement,
  CustomerOnboardingAnswers,
  CustomerPolicyForm,
  CustomerProfile,
  CustomerProfilePatch,
  DuplicateScheduleInput,
  EventStatus,
  MarketingInsights,
  MarketingInsightsQuery,
  OnboardingStatus,
  PaymentAccountType,
  PaymentInstructions,
  PaymentMethod,
  PaymentQrCode,
  PermissionKey,
  PolicyAcceptance,
  PolicyDocumentVersion,
  PolicyFormRequirements,
  PublicBundle,
  PublicClass,
  PublicCoach,
  PublicContent,
  PublicEventPage,
  PublicRoster,
  PublicSession,
  PublicSessionPage,
  RecurringScheduleInput,
  ScheduleGenerationResult,
  SessionReportDrilldown,
  SessionStatus,
  ShareParams,
  SubstituteCoachOption,
  VenueKind,
} from "@balanse/domain";

export type AdminPaymentQueueQuery = {
  tab?: AdminPaymentTab;
  search?: string;
  limit?: number;
  cursor?: string;
};

export type AdminRequestQueueQuery = {
  search?: string;
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

  /** #343 — null for DRAFT (or unknown) sessions. */
  getPublicSessionPage: (sessionId: string) => Promise<PublicSessionPage | null>;
  /** #343 — null for DRAFT / ARCHIVED events. Effective CANCELLED when its session is cancelled. */
  getPublicEventPage: (eventId: string) => Promise<PublicEventPage | null>;
  /**
   * #343 — mirrors `app_public.public_session_roster`: counts for a guest
   * (`viewer` null), display-only rows for a signed-in customer. Null for DRAFT.
   */
  getPublicRoster: (
    sessionId: string,
    viewer: { customerId: string } | null,
  ) => Promise<PublicRoster | null>;

  getMe: (customerId: string) => Promise<CustomerProfile | null>;
  patchMe: (customerId: string, patch: CustomerProfilePatch) => Promise<CustomerProfile>;
  /** #343 — data URL (JPG/PNG/WEBP ≤ 5 MB) from the cropper, or null to remove. */
  setMyAvatar: (customerId: string, avatar: { dataUrl: string } | null) => Promise<CustomerProfile>;
  getMyOnboarding: (customerId: string) => Promise<CustomerOnboardingAnswers | null>;
  saveMyOnboarding: (
    customerId: string,
    patch: Partial<Omit<CustomerOnboardingAnswers, "updatedAt">>,
  ) => Promise<CustomerOnboardingAnswers>;
  completeOnboarding: (customerId: string) => Promise<CustomerProfile>;
  skipOnboarding: (customerId: string) => Promise<CustomerProfile>;
  /** Referral channel recorded at sign-up (for the onboarding heard-from prefill). */
  getMyReferralChannel: (
    customerId: string,
  ) => Promise<import("@balanse/domain").ReferralChannel | null>;
  getMePolicyAcceptances: (customerId: string) => Promise<PolicyAcceptance[]>;
  /** Current versions of the policies admin attached to a customer form. */
  getCustomerFormPolicies: (form: CustomerPolicyForm) => Promise<PolicyDocumentVersion[]>;
  acceptPolicies: (customerId: string, acceptances: PolicyAcceptance[]) => Promise<void>;
  createCustomer: (input: {
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    authMethod?: "email" | "google";
    /** Share attribution from the `balanse_share_attr` cookie. Unknown codes are ignored. */
    attribution?: ShareParams;
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
  /** Coach-scoped student cohorts. The authorization wrapper always supplies the linked coach id. */
  getCoachStudents: (coachId?: string) => Promise<CoachStudent[]>;
  getCoachStudent: (customerId: string, coachId?: string) => Promise<CoachStudentDetail | null>;
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
  getAdminVenues: () => Promise<AdminVenue[]>;
  upsertAdminVenue: (input: {
    id?: string;
    name: string;
    address: string;
    kind: VenueKind;
    openingHours: string;
    studioOwned: boolean;
    active: boolean;
    notes: string;
  }) => Promise<AdminVenue>;
  getAdminSessions: () => Promise<AdminSession[]>;
  upsertAdminSession: (input: {
    id?: string;
    classId: string;
    venueId: string;
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
  /**
   * Coach class change requests (#337). Approvers see every request; a coach
   * sees only their own. The auth wrapper supplies requester / reviewer ids.
   */
  getClassChangeRequests: (query?: {
    sessionId?: string;
    requestedByStaffId?: string;
  }) => Promise<ClassChangeRequest[]>;
  getSubstituteCoachOptions: (sessionId: string) => Promise<SubstituteCoachOption[]>;
  createClassChangeRequest: (
    input: CreateClassChangeRequestInput,
    requester?: { staffId: string; coachId: string },
  ) => Promise<ClassChangeRequest>;
  withdrawClassChangeRequest: (id: string, staffId?: string) => Promise<ClassChangeRequest>;
  approveClassChangeRequest: (
    id: string,
    note?: string | null,
    reviewerStaffId?: string,
  ) => Promise<ClassChangeRequest>;
  denyClassChangeRequest: (
    id: string,
    note: string,
    reviewerStaffId?: string,
  ) => Promise<ClassChangeRequest>;
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
    /** #343 — identity per customer id. Onboarding stripped unless the viewer may see it. */
    people: Record<string, AdminRosterPerson>;
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
    /** Matches name, nickname, email, or contact number. */
    query?: string;
    hasUpcoming?: boolean;
    onboardingStatus?: OnboardingStatus;
  }) => Promise<AdminCustomer[]>;
  /** #354 — `reports.marketing.read`. Counts only. */
  getAdminMarketingInsights: (query: MarketingInsightsQuery) => Promise<MarketingInsights>;
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
  /** Deletes every version of a policy and detaches it from customer forms. */
  deletePolicy: (documentName: string) => Promise<AdminSettings>;
  setPolicyFormRequirements: (requirements: PolicyFormRequirements) => Promise<AdminSettings>;
  updateAdminSettings: (patch: Partial<AdminSettings>) => Promise<AdminSettings>;
  listPaymentQrs: (includeArchived?: boolean) => Promise<{
    items: PaymentQrCode[];
    activeId: string | null;
  }>;
  /** Create or edit a payment account (GCash, Maya, or QR Ph). */
  upsertPaymentQr: (input: {
    id?: string;
    type: PaymentAccountType;
    label: string;
    accountName: string;
    accountNumber: string;
    imageKey: string | null;
    isActive: boolean;
  }) => Promise<PaymentQrCode>;
  /** Show or hide an account at customer checkout. Several can be shown at once. */
  setPaymentQrActive: (id: string, active: boolean) => Promise<PaymentQrCode>;
  /** Removes the account from the list; history keeps the archived row. */
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
  /** Granted / held / used / restored credits per package, keyed by bundle id. */
  getAdminBundleMetrics: () => Promise<Record<string, BundleCreditMetrics>>;
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
