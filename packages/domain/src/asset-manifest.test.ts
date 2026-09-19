import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ASSET_MANIFEST,
  bundledAssetSrc,
  bundledMasterSrc,
  publicPageSlotIds,
} from "./asset-manifest";

const here = dirname(fileURLToPath(import.meta.url));

describe("FE-SHR-004 asset manifest", () => {
  it("stays byte-equivalent to the Assets-track inventory", () => {
    const docs = JSON.parse(
      readFileSync(resolve(here, "../../../docs/assets/manifest.json"), "utf8"),
    );
    const packaged = JSON.parse(readFileSync(resolve(here, "./asset-manifest.json"), "utf8"));
    expect(packaged).toEqual(docs);
    expect(ASSET_MANIFEST.schema_version).toBe("1.0.0");
  });

  it("resolves approved ASSET-012 headshots to bundled public paths", () => {
    const rex = ASSET_MANIFEST.assets.find(
      (asset) => asset.id === "coach-headshot-rex-francis-regis",
    );
    expect(rex).toBeDefined();
    if (!rex) return;
    expect(bundledAssetSrc(rex)).toBe("/assets/headshots/rex-francis-regis/headshot-card-4x5.webp");
    expect(bundledMasterSrc(rex)).toBe("/assets/headshots/rex-francis-regis/headshot-4x5.jpg");
    expect(bundledAssetSrc(rex)).not.toMatch(/^https?:/);
  });

  it("resolves approved marketing working files to bundled public paths", () => {
    const hero = ASSET_MANIFEST.assets.find((asset) => asset.id === "landing-a");
    expect(hero?.approval_status).toBe("approved");
    expect(bundledAssetSrc(hero as NonNullable<typeof hero>)).toBe(
      "/assets/marketing/landing/hero-accent-16x9.webp",
    );
  });

  it("covers every public-page lettered slot", () => {
    expect(publicPageSlotIds("landing")).toEqual([
      "landing-a",
      "landing-b",
      "landing-c",
      "landing-d",
    ]);
    expect(publicPageSlotIds("about")).toEqual(["about-a", "about-b", "about-c"]);
    expect(publicPageSlotIds("contact")).toEqual(["contact-a", "contact-b"]);
    expect(publicPageSlotIds("faqs")).toEqual(["faqs-a"]);
    expect(publicPageSlotIds("coaches")).toEqual([
      "coaches-a",
      "coaches-b",
      "coaches-c",
      "coaches-c-yoga",
      "coaches-c-boxing",
      "coaches-c-capoeira",
    ]);
  });
});
