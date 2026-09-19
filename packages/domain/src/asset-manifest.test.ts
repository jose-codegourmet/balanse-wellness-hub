import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ASSET_MANIFEST, publicPageSlotIds } from "./asset-manifest";

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
    expect(publicPageSlotIds("coaches")).toEqual(["coaches-a", "coaches-b", "coaches-c"]);
  });
});
