import { describe, expect, it } from "vitest";
import {
  COACHES_ON_PLACEHOLDER,
  COACHES_WITH_HEADSHOTS,
  coachPhotoKey,
  resolveCoachPhotoSrc,
} from "./assets";

describe("coach photo resolution", () => {
  it("maps the eight ASSET-012 slugs to bundled card/avatar files", () => {
    expect(COACHES_WITH_HEADSHOTS).toHaveLength(8);
    expect(resolveCoachPhotoSrc(coachPhotoKey("ephraim-bacaltos"), "4:5")).toBe(
      "/assets/headshots/ephraim-bacaltos/headshot-card-4x5.webp",
    );
    expect(resolveCoachPhotoSrc(coachPhotoKey("wolf"), "1:1")).toBe(
      "/assets/headshots/wolf/headshot-1x1.webp",
    );
  });

  it("keeps Alec, Sofia, and Kate on the ASSET-014 placeholder", () => {
    expect(COACHES_ON_PLACEHOLDER).toEqual(["alec-james-co", "sofia-ocampo", "kate-go"]);
    expect(resolveCoachPhotoSrc(null, "4:5")).toBe(
      "/assets/placeholders/coach-placeholder-4x5.svg",
    );
    expect(resolveCoachPhotoSrc("coach-photos/alec-james-co", "1:1")).toBe(
      "/assets/placeholders/coach-placeholder-1x1.svg",
    );
  });

  it("never returns a Storage or https URL", () => {
    expect(resolveCoachPhotoSrc("https://storage.example/coach.jpg")).toMatch(/^\/assets\//);
  });
});
