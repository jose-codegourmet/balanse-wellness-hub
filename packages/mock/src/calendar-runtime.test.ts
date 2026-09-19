import { afterEach, describe, expect, it } from "vitest";
import { getMockAdapter } from "./memory-adapter";
import { resetMockRuntime, setMockRuntime } from "./runtime";

describe("calendar mock runtime", () => {
  afterEach(() => {
    resetMockRuntime();
  });

  it("can fail the public schedule load", async () => {
    setMockRuntime({ failPublicSessions: true });
    await expect(getMockAdapter().getPublicSessions()).rejects.toThrow(/Mocked request failed/);
  });

  it("can mark a viewed session as newly full", async () => {
    setMockRuntime({ sessionBecameFullId: "session-wed-open" });
    const session = await getMockAdapter().getPublicSession("session-wed-open");
    expect(session?.remainingSlots).toBe(0);
    expect(session?.availability).toBe("full_with_waitlist");
  });
});
