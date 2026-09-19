export const MOCK_HARNESS_COOKIE = "balanse-mock-principal";

export type MockPrincipal = {
  role: "guest" | "customer" | "admin";
  customerId: string;
  showcaseBookingId: string;
};

const DEFAULT: MockPrincipal = {
  role: "guest",
  customerId: "cust-ana",
  showcaseBookingId: "booking-held_awaiting_payment",
};

export function parseMockPrincipal(raw: string | undefined | null): MockPrincipal {
  if (!raw) return { ...DEFAULT };
  try {
    const parsed = JSON.parse(raw) as Partial<MockPrincipal>;
    return {
      role:
        parsed.role === "customer" || parsed.role === "admin" || parsed.role === "guest"
          ? parsed.role
          : "guest",
      customerId: parsed.customerId ?? DEFAULT.customerId,
      showcaseBookingId: parsed.showcaseBookingId ?? DEFAULT.showcaseBookingId,
    };
  } catch {
    return { ...DEFAULT };
  }
}
