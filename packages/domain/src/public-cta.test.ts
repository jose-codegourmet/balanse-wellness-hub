import { describe, expect, it } from "vitest";
import {
  PRIMARY_SCHEDULE_ACTION,
  PUBLIC_CTA_BLOCKS,
  PUBLIC_FOOTER_COLUMNS,
  PUBLIC_FOOTER_NOTE,
  PUBLIC_SOCIAL_LINKS,
  publicCtaBlock,
  publicCtaHrefs,
  publicFooterYear,
} from "./public-cta";

/** Routes that exist under apps/web today. Keep in sync when a public route is added. */
const KNOWN_ROUTES = new Set([
  "/",
  "/about",
  "/coaches",
  "/contact",
  "/faqs",
  "/login",
  "/sign-up",
  "/forgot-password",
]);

function routeOf(href: string): string {
  const [path] = href.split("#");
  const [route] = (path ?? "").split("?");
  return route === "" ? "/" : (route ?? "/");
}

describe("public CTA and footer catalogs", () => {
  it("never points a CTA or footer link at a route that does not exist", () => {
    for (const href of publicCtaHrefs()) {
      expect(href.startsWith("/"), href).toBe(true);
      expect(KNOWN_ROUTES.has(routeOf(href)), href).toBe(true);
    }
  });

  it("gives every CTA block a label, body, and at least one action", () => {
    for (const block of Object.values(PUBLIC_CTA_BLOCKS)) {
      expect(block.title.length, block.id).toBeGreaterThan(0);
      expect(block.body.length, block.id).toBeGreaterThan(0);
      expect(block.actions.length, block.id).toBeGreaterThan(0);
      for (const action of block.actions) {
        expect(action.label.trim(), `${block.id}/${action.id}`).not.toBe("");
        expect(action.href.trim(), `${block.id}/${action.id}`).not.toBe("");
      }
    }
  });

  it("keeps the schedule as the single primary action wording", () => {
    expect(PRIMARY_SCHEDULE_ACTION.href).toBe("/#schedule");
    const primaries = Object.values(PUBLIC_CTA_BLOCKS)
      .flatMap((block) => block.actions)
      .filter((action) => action.id === "schedule");
    expect(primaries.length).toBeGreaterThan(0);
    expect(new Set(primaries.map((action) => action.label)).size).toBe(1);
  });

  it("keeps rate, price, and admin vocabulary off public CTA copy", () => {
    const copy = Object.values(PUBLIC_CTA_BLOCKS)
      .flatMap((block) => [block.eyebrow, block.title, block.body, PUBLIC_FOOTER_NOTE])
      .join(" ")
      .toLowerCase();
    for (const banned of ["rate", "payout", "₱", "php", "commission", "admin portal"]) {
      expect(copy, banned).not.toMatch(new RegExp(`\\b${banned}\\b`));
    }
  });

  it("carries no placeholder or TODO copy", () => {
    const copy = [
      ...Object.values(PUBLIC_CTA_BLOCKS).flatMap((block) => [
        block.eyebrow,
        block.title,
        block.body,
      ]),
      PUBLIC_FOOTER_NOTE,
      ...PUBLIC_FOOTER_COLUMNS.flatMap((column) => column.links.map((link) => link.label)),
    ]
      .join(" ")
      .toLowerCase();
    for (const banned of ["placeholder", "todo", "coming soon", "lorem"]) {
      expect(copy, banned).not.toContain(banned);
    }
  });

  it("exposes three footer columns and four social channels with absolute social hrefs", () => {
    expect(PUBLIC_FOOTER_COLUMNS.map((column) => column.id)).toEqual([
      "explore",
      "studio",
      "account",
    ]);
    expect(PUBLIC_SOCIAL_LINKS).toHaveLength(4);
    for (const social of PUBLIC_SOCIAL_LINKS) {
      expect(social.href, social.id).toMatch(/^https:\/\//);
    }
  });

  it("resolves blocks by id and reports a sane copyright year", () => {
    expect(publicCtaBlock("landing-final").assetId).toBe("landing-d");
    expect(publicFooterYear(new Date("2026-09-19T00:00:00Z"))).toBe(2026);
  });
});
