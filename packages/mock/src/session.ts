export const MOCK_HARNESS_COOKIE = "balanse-mock-principal";
export const MOCK_HARNESS_ENV = "NEXT_PUBLIC_ENABLE_MOCK_HARNESS";

export type MockRole = "guest" | "customer" | "admin";

export type MockPrincipal = {
  role: MockRole;
  customerId: string;
  showcaseBookingId: string;
};

export const DEFAULT_MOCK_PRINCIPAL: MockPrincipal = {
  role: "guest",
  customerId: "cust-ana",
  showcaseBookingId: "booking-held_awaiting_payment",
};

export function isMockHarnessEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MOCK_HARNESS === "true";
}

export function parseMockPrincipal(raw: string | undefined | null): MockPrincipal {
  if (!raw) return { ...DEFAULT_MOCK_PRINCIPAL };
  try {
    const parsed = JSON.parse(raw) as Partial<MockPrincipal>;
    return {
      role:
        parsed.role === "customer" || parsed.role === "admin" || parsed.role === "guest"
          ? parsed.role
          : "guest",
      customerId: parsed.customerId ?? DEFAULT_MOCK_PRINCIPAL.customerId,
      showcaseBookingId: parsed.showcaseBookingId ?? DEFAULT_MOCK_PRINCIPAL.showcaseBookingId,
    };
  } catch {
    return { ...DEFAULT_MOCK_PRINCIPAL };
  }
}

export function serializeMockPrincipal(principal: MockPrincipal): string {
  return JSON.stringify(principal);
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
