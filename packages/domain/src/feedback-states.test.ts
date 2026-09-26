import { describe, expect, it } from "vitest";
import { FEEDBACK_STATE_DEFAULTS, FEEDBACK_STATE_IDS } from "./feedback-states";

describe("FE-SHR-003 feedback catalog", () => {
  it("enumerates the 15 required states", () => {
    expect(FEEDBACK_STATE_IDS).toHaveLength(27);
    for (const id of FEEDBACK_STATE_IDS) {
      expect(FEEDBACK_STATE_DEFAULTS[id].id).toBe(id);
      expect(FEEDBACK_STATE_DEFAULTS[id].title.length).toBeGreaterThan(0);
    }
  });

  it("offers retry copy on load and upload failures", () => {
    expect(FEEDBACK_STATE_DEFAULTS["calendar.load-failed"].actionLabel).toBe("Retry");
    expect(FEEDBACK_STATE_DEFAULTS["customer.proof-upload-failed"].actionLabel).toBe("Try again");
  });
});
