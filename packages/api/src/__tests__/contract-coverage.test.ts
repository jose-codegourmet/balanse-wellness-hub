import { API_CONTRACT_ROUTES } from "@balanse/db/contracts/routes";
import { describe, expect, it } from "vitest";
import { matchRoute, ROUTES } from "../router";

describe("BE-024 contract coverage", () => {
  it("implements every inventoried route", () => {
    expect(ROUTES).toHaveLength(API_CONTRACT_ROUTES.length);
    for (const route of API_CONTRACT_ROUTES) {
      const matched = matchRoute(route.method, route.path.replace("{id}", "sample-id"));
      expect(matched?.route.path, `${route.method} ${route.path}`).toBe(route.path);
    }
  });

  it("does not expose a customer CANCELLED shortcut", () => {
    expect(matchRoute("post", "/api/bookings/sample-id/cancel")).toBeNull();
    expect(matchRoute("delete", "/api/bookings/sample-id")).toBeNull();
  });
});
