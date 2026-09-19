import { describe, expect, it } from "vitest";
import { requireAdmin, requireCustomer } from "../auth";
import { ApiError } from "../errors";
import { requiredDateRange } from "../http";

describe("route authorisation helpers", () => {
  it("blocks anon customers and non-admin staff paths", () => {
    expect(() => requireCustomer({ kind: "anon" })).toThrow(ApiError);
    expect(() => requireAdmin({ kind: "anon" })).toThrow(ApiError);
    expect(() =>
      requireAdmin({ kind: "customer", userId: "u", email: null, authMethod: "email" }),
    ).toThrow(/Admin/);
    expect(
      requireAdmin({
        kind: "admin",
        userId: "u",
        staffId: "s",
        email: null,
        authMethod: "email",
      }).staffId,
    ).toBe("s");
  });
});

describe("reports date range", () => {
  it("requires and validates from/to", () => {
    expect(() => requiredDateRange(new URLSearchParams())).toThrow(/required/i);
    expect(() =>
      requiredDateRange(new URLSearchParams("from=2026-01-01T00:00:00Z&to=2026-01-01T00:00:00Z")),
    ).toThrow(/earlier/);
    const ok = requiredDateRange(
      new URLSearchParams("from=2026-01-01T00:00:00Z&to=2026-01-08T00:00:00Z"),
    );
    expect(ok.from.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });
});
