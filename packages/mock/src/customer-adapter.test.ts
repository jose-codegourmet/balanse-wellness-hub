import { computeHoldExpiresAt } from "@balanse/domain";
import { afterEach, describe, expect, it } from "vitest";
import { MOCK_NOW_ISO } from "./fixtures";
import { createMemoryAdapter } from "./memory-adapter";
import { resetMockRuntime, setMockRuntime } from "./runtime";

describe("customer mock adapter", () => {
  afterEach(() => {
    resetMockRuntime();
  });

  it("creates a hold that never extends past class start", async () => {
    const adapter = createMemoryAdapter();
    const booking = await adapter.createBooking({
      customerId: "cust-ana",
      sessionId: "session-thu-early",
    });
    const session = await adapter.getPublicSession("session-thu-early");
    expect(session).toBeTruthy();
    expect(booking.holdExpiresAt).toBe(
      computeHoldExpiresAt(MOCK_NOW_ISO, session?.startsAt ?? "").toISOString(),
    );
    expect(new Date(booking.holdExpiresAt ?? 0).getTime()).toBeLessThanOrEqual(
      new Date(session?.startsAt ?? 0).getTime(),
    );
  });

  it("patches the same profile object the booking form reads", async () => {
    const adapter = createMemoryAdapter();
    await adapter.patchMe("cust-ana", { fullName: "Ana Updated", contactNumber: "+63 111" });
    const me = await adapter.getMe("cust-ana");
    expect(me?.fullName).toBe("Ana Updated");
    expect(me?.contactNumber).toBe("+63 111");
  });

  it("fails proof upload when the harness flag is on", async () => {
    setMockRuntime({ failProofUpload: true });
    const adapter = createMemoryAdapter();
    await expect(adapter.uploadPaymentProof("booking-held_awaiting_payment")).rejects.toThrow(
      /Proof upload failed/,
    );
  });
});
