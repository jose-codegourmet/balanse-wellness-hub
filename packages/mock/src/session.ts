import type { StaffAuthorizationActor } from "@balanse/domain";
import {
  isMockStaffIdentityId,
  MOCK_STAFF_IDS,
  type MockStaffIdentityId,
  resolveMockStaffActorFromStaffId,
} from "./staff-fixtures";

export type { MockStaffIdentityId };

export const MOCK_HARNESS_COOKIE = "balanse-mock-principal";
export const MOCK_HARNESS_ENV = "NEXT_PUBLIC_ENABLE_MOCK_HARNESS";

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

export function isMockHarnessEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MOCK_HARNESS === "true";
}

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

export function parseMockPrincipal(raw: string | undefined | null): MockPrincipal {
  if (!raw) return { ...DEFAULT_MOCK_PRINCIPAL };
  try {
    return normalizeMockPrincipal(JSON.parse(raw) as Partial<MockPrincipal>);
  } catch {
    return { ...DEFAULT_MOCK_PRINCIPAL };
  }
}

export function serializeMockPrincipal(principal: MockPrincipal): string {
  return JSON.stringify(normalizeMockPrincipal(principal));
}

export function mockPrincipalForStaff(staffId: MockStaffIdentityId): MockPrincipal {
  return normalizeMockPrincipal({
    ...DEFAULT_MOCK_PRINCIPAL,
    role: "admin",
    staffId,
  });
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

/** Adapter-scoped principal. Query factories and the harness must bind this. */
export function bindMockPrincipal(principal: MockPrincipal): MockPrincipal {
  boundPrincipal = normalizeMockPrincipal(principal);
  return boundPrincipal;
}

export function getBoundMockPrincipal(): MockPrincipal {
  return boundPrincipal;
}

export function resetBoundMockPrincipal(): void {
  boundPrincipal = normalizeMockPrincipal({
    role: "admin",
    staffId: DEFAULT_ADMIN_STAFF_ID,
  });
}

export function getBoundMockStaffActor(): StaffAuthorizationActor | null {
  return resolveMockStaffActor(boundPrincipal);
}

/**
 * WIRE-002 removal path:
 * 1. Delete `@balanse/mock/session` usage from app providers and middleware.
 * 2. Remove `MockSessionHarness` from both shells.
 * 3. Drop `NEXT_PUBLIC_ENABLE_MOCK_HARNESS`.
 * 4. Replace `getMockAdapter()` with the real data-access layer from WIRE-001.
 * See `docs/engineering/mock-harness-removal.md`.
 */
export const WIRE_002_REMOVAL_DOC = "docs/engineering/mock-harness-removal.md";
