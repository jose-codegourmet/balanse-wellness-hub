import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ASSET_MANIFEST,
  bundledAssetSources,
  bundledAssetSrc,
  bundledMasterSrc,
  COACH_SPECIALTY_ACCENT_IDS,
  publicPageSlotIds,
  publishedMarketingSlotIds,
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
    const expected: Record<string, string> = {
      "landing-a": "/assets/marketing/landing/hero-accent-16x9.webp",
      "landing-b": "/assets/marketing/landing/classes-editorial-3x2.webp",
      "landing-c": "/assets/marketing/landing/how-it-works-still-life-1x1.webp",
      "landing-d": "/assets/marketing/landing/final-cta-21x9.webp",
      "landing-e": "/assets/marketing/landing/mid-cta-21x9.webp",
      "about-a": "/assets/marketing/about/hero-16x9.webp",
      "about-b": "/assets/marketing/about/our-approach-4x3.webp",
      "about-c": "/assets/marketing/about/brand-texture-3x1.webp",
      "about-d": "/assets/marketing/about/cta-band-21x9.webp",
      "contact-a": "/assets/marketing/contact/visit-hero-16x9.webp",
      "contact-b": "/assets/marketing/contact/walk-in-qr-1x1.webp",
      "faqs-a": "/assets/marketing/faqs/header-accent-3x2.webp",
      "coaches-c-yoga": "/assets/marketing/coaches/specialty-accent-yoga-1x1.webp",
      "coaches-c-boxing": "/assets/marketing/coaches/specialty-accent-boxing-1x1.webp",
      "coaches-c-capoeira": "/assets/marketing/coaches/specialty-accent-capoeira-1x1.webp",
      "coaches-c-calisthenics": "/assets/marketing/coaches/specialty-accent-calisthenics-1x1.webp",
      "coaches-c-pilates": "/assets/marketing/coaches/specialty-accent-pilates-1x1.webp",
      "coaches-c-dance": "/assets/marketing/coaches/specialty-accent-dance-1x1.webp",
    };
    expect(publishedMarketingSlotIds("landing")).toEqual([
      "landing-a",
      "landing-b",
      "landing-c",
      "landing-d",
      "landing-e",
    ]);
    expect(publishedMarketingSlotIds("about")).toEqual([
      "about-a",
      "about-b",
      "about-c",
      "about-d",
    ]);
    expect(publishedMarketingSlotIds("contact")).toEqual(["contact-a", "contact-b"]);
    expect(publishedMarketingSlotIds("faqs")).toEqual(["faqs-a"]);
    expect(publishedMarketingSlotIds("coaches")).toEqual([...COACH_SPECIALTY_ACCENT_IDS]);
    expect(COACH_SPECIALTY_ACCENT_IDS).toEqual([
      "coaches-c-yoga",
      "coaches-c-boxing",
      "coaches-c-capoeira",
      "coaches-c-calisthenics",
      "coaches-c-pilates",
      "coaches-c-dance",
    ]);
    for (const [id, src] of Object.entries(expected)) {
      const asset = ASSET_MANIFEST.assets.find((item) => item.id === id);
      expect(asset, id).toBeDefined();
      if (!asset) continue;
      expect(bundledAssetSrc(asset)).toBe(src);
      expect(bundledAssetSrc(asset)).not.toMatch(/placeholder/);
      const relative = src.replace(/^\//, "");
      expect(existsSync(resolve(here, "../../../apps/web/public", relative))).toBe(true);
    }
    const groupHero = ASSET_MANIFEST.assets.find((asset) => asset.id === "coaches-b");
    expect(groupHero?.generation_policy).toBe("do_not_generate");
    expect(bundledAssetSrc(groupHero as NonNullable<typeof groupHero>)).toBeUndefined();
  });

  it("bundles every FE-PATHS slot with its JPEG and thumb siblings on disk", () => {
    const publicDir = resolve(here, "../../../apps/web/public");
    const slots = (["landing", "about", "contact", "faqs", "coaches"] as const).flatMap((page) =>
      publishedMarketingSlotIds(page),
    );
    // Pass-2 inventory: landing A–E, about A–D, contact A–B, faqs A, six accents.
    expect(slots.length).toBe(18);
    // `about-c` and `contact-b` were left unchanged and ship no thumb.
    const withoutThumbs = new Set(["about-c", "contact-b"]);

    for (const id of slots) {
      const asset = ASSET_MANIFEST.assets.find((item) => item.id === id);
      expect(asset, id).toBeDefined();
      if (!asset) continue;
      const sources = bundledAssetSources(asset);
      expect(sources, id).toBeDefined();
      expect(sources?.webp, id).toMatch(/^\/assets\/marketing\/.+\.webp$/);
      expect(sources?.jpeg, id).toMatch(/^\/assets\/marketing\/.+\.jpg$/);

      const expectThumbs = !withoutThumbs.has(id);
      expect(Boolean(sources?.thumbWebp), id).toBe(expectThumbs);

      const files = [sources?.webp, sources?.jpeg, sources?.thumbWebp, sources?.thumbJpeg].filter(
        (src): src is string => typeof src === "string",
      );
      expect(files.length, id).toBe(expectThumbs ? 4 : 2);
      for (const src of files) {
        expect(existsSync(resolve(publicDir, src.replace(/^\//, ""))), src).toBe(true);
      }
    }
  });

  it("covers every public-page lettered slot", () => {
    expect(publicPageSlotIds("landing")).toEqual([
      "landing-a",
      "landing-b",
      "landing-c",
      "landing-d",
      "landing-e",
    ]);
    expect(publicPageSlotIds("about")).toEqual(["about-a", "about-b", "about-c", "about-d"]);
    expect(publicPageSlotIds("contact")).toEqual(["contact-a", "contact-b"]);
    expect(publicPageSlotIds("faqs")).toEqual(["faqs-a"]);
    expect(publicPageSlotIds("coaches")).toEqual([
      "coaches-a",
      "coaches-b",
      "coaches-c",
      "coaches-c-yoga",
      "coaches-c-boxing",
      "coaches-c-capoeira",
      "coaches-c-calisthenics",
      "coaches-c-pilates",
      "coaches-c-dance",
    ]);
  });
});
