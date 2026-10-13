import type { StaffAuthorizationActor } from "@balanse/domain";
import {
  isMockStaffIdentityId,
  MOCK_STAFF_IDS,
  type MockStaffIdentityId,
  resolveMockStaffActorFromStaffId,
} from "./staff-fixtures";

export type { MockStaffIdentityId };

export type MockRole = "guest" | "customer" | "admin";

export type MockPrincipal = {
  role: MockRole;
  customerId: string;
  showcaseBookingId: string;
  /**
   * Staff member the principal is acting as. Authorization derives from this
   * row (role, permissions, coach link). `role: "admin"` is not enough.
   */
  staffId: string | null;
};

export const DEFAULT_MOCK_PRINCIPAL: MockPrincipal = {
  role: "guest",
  customerId: "cust-ana",
  showcaseBookingId: "booking-held_awaiting_payment",
  staffId: null,
};

export const DEFAULT_ADMIN_STAFF_ID = MOCK_STAFF_IDS.rex;

export function normalizeMockPrincipal(
  input: Partial<MockPrincipal> | null | undefined,
): MockPrincipal {
  const role: MockRole =
    input?.role === "customer" || input?.role === "admin" || input?.role === "guest"
      ? input.role
      : "guest";
  const requestedStaffId = input?.staffId ?? null;
  const staffId =
    role === "admin"
      ? isMockStaffIdentityId(requestedStaffId)
        ? requestedStaffId
        : DEFAULT_ADMIN_STAFF_ID
      : null;
  return {
    role,
    customerId: input?.customerId ?? DEFAULT_MOCK_PRINCIPAL.customerId,
    showcaseBookingId: input?.showcaseBookingId ?? DEFAULT_MOCK_PRINCIPAL.showcaseBookingId,
    staffId,
  };
}

export function resolveMockStaffActor(
  principal: MockPrincipal | null | undefined,
): StaffAuthorizationActor | null {
  if (principal?.role !== "admin") return null;
  return resolveMockStaffActorFromStaffId(principal.staffId);
}

let boundPrincipal: MockPrincipal = normalizeMockPrincipal({
  role: "admin",
  staffId: DEFAULT_ADMIN_STAFF_ID,
});

/** Storybook adapter principal, selected by the preview decorator. */
export function bindMockPrincipal(principal: MockPrincipal): MockPrincipal {
  boundPrincipal = normalizeMockPrincipal(principal);
  return boundPrincipal;
}

export function getBoundMockPrincipal(): MockPrincipal {
  return boundPrincipal;
}

export function getBoundMockStaffActor(): StaffAuthorizationActor | null {
  return resolveMockStaffActor(boundPrincipal);
}
