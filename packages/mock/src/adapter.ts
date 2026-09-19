import type {
  AdminCoach,
  AdminCustomer,
  AdminStaff,
  BookingStatus,
  CustomerBooking,
  CustomerProfile,
  PaymentInstructions,
  PaymentMethod,
  PolicyAcceptance,
  PublicClass,
  PublicCoach,
  PublicContent,
  PublicSession,
} from "@balanse/domain";

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
    patch: Partial<Pick<CustomerProfile, "fullName" | "contactNumber">>,
  ) => Promise<CustomerProfile>;
  getMePolicyAcceptances: (customerId: string) => Promise<PolicyAcceptance[]>;

  createBooking: (input: { customerId: string; sessionId: string }) => Promise<CustomerBooking>;
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
  }) => Promise<CustomerBooking[]>;
  confirmAdminBooking: (id: string) => Promise<CustomerBooking>;
  rejectAdminBooking: (id: string, reason: string) => Promise<CustomerBooking>;
  getAdminPayments: () => Promise<CustomerBooking[]>;
  recordCash: (bookingId: string) => Promise<CustomerBooking>;
  markRefundPending: (bookingId: string) => Promise<CustomerBooking>;
  markRefunded: (bookingId: string) => Promise<CustomerBooking>;
  getAdminPaymentProofSignedUrl: (bookingId: string) => Promise<{ url: string }>;
  getAdminClasses: () => Promise<PublicClass[]>;
  getAdminCoaches: () => Promise<AdminCoach[]>;
  getAdminSessions: () => Promise<PublicSession[]>;
  cancelAdminSession: (id: string) => Promise<PublicSession>;
  getAdminCancellationRequests: () => Promise<CustomerBooking[]>;
  getAdminRescheduleRequests: () => Promise<CustomerBooking[]>;
  getAdminSessionRoster: (sessionId: string) => Promise<{
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
  }>;
  checkIn: (bookingId: string) => Promise<CustomerBooking>;
  markNoShow: (bookingId: string) => Promise<CustomerBooking>;
  getAdminReportsSales: () => Promise<{ grossPhp: number; refundsPhp: number; netPhp: number }>;
  getAdminStaff: () => Promise<AdminStaff[]>;
  getAdminCustomers: () => Promise<AdminCustomer[]>;
  getAdminCustomer: (id: string) => Promise<AdminCustomer | null>;
  getAdminSettings: () => Promise<PublicContent & PaymentInstructions>;
};

export type MockRuntimeOptions = {
  latencyMs: number;
  failNext: boolean;
};

export const defaultMockRuntime: MockRuntimeOptions = {
  latencyMs: 0,
  failNext: false,
};
