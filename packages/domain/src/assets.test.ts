import { describe, expect, it } from "vitest";
import {
  COACHES_ON_PLACEHOLDER,
  COACHES_WITH_HEADSHOTS,
  coachPhotoKey,
  localCoachMasterPath,
  resolveCoachPhotoSources,
  resolveCoachPhotoSrc,
} from "./assets";

describe("coach photo resolution", () => {
  it("maps the eight ASSET-013 slugs to card 4:5 and avatar 1:1 delivery files", () => {
    expect(COACHES_WITH_HEADSHOTS).toHaveLength(8);
    const card = resolveCoachPhotoSources(coachPhotoKey("ephraim-bacaltos"), "card");
    expect(card.webp).toBe("/assets/headshots/ephraim-bacaltos/headshot-card-4x5.webp");
    expect(card.jpeg).toBe("/assets/headshots/ephraim-bacaltos/headshot-card-4x5.jpg");
    expect(card.srcSetWebp).toContain("headshot-card-4x5-w400.webp");
    expect(card.masterJpeg).toBe(localCoachMasterPath("ephraim-bacaltos", "jpg"));

    const avatar = resolveCoachPhotoSources(coachPhotoKey("wolf"), "avatar");
    expect(avatar.webp).toBe("/assets/headshots/wolf/headshot-1x1.webp");
    expect(avatar.srcSetWebp).toContain("headshot-1x1-w200.webp");
    expect(avatar.srcSetWebp).toContain("headshot-1x1-w400.webp");

    expect(resolveCoachPhotoSrc(coachPhotoKey("ephraim-bacaltos"), "4:5")).toBe(card.webp);
    expect(resolveCoachPhotoSrc(coachPhotoKey("wolf"), "1:1")).toBe(avatar.webp);
  });

  it("keeps masters available on the source map", () => {
    const master = resolveCoachPhotoSources(coachPhotoKey("jodi-tio"), "master");
    expect(master.webp).toBe("/assets/headshots/jodi-tio/headshot-4x5.webp");
    expect(master.jpeg).toBe("/assets/headshots/jodi-tio/headshot-4x5.jpg");
  });

  it("keeps Alec, Sofia, and Kate on the ASSET-014 placeholder", () => {
    expect(COACHES_ON_PLACEHOLDER).toEqual(["alec-james-co", "sofia-ocampo", "kate-go"]);
    expect(resolveCoachPhotoSrc(null, "4:5")).toBe(
      "/assets/placeholders/coach-placeholder-4x5.svg",
    );
    expect(resolveCoachPhotoSources("coach-photos/alec-james-co", "avatar").isPlaceholder).toBe(
      true,
    );
  });

  it("never returns a Storage or https URL", () => {
    expect(resolveCoachPhotoSrc("https://storage.example/coach.jpg")).toMatch(/^\/assets\//);
  });
});
