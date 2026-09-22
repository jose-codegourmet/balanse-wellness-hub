import { describe, expect, it, vi } from "vitest";
import type { ApiDeps } from "../deps";
import { dispatch } from "../dispatch";

function deps(kind: "anon" | "customer" | "admin"): ApiDeps {
  return {
    prisma: {
      staffMember: {
        findFirst: vi.fn(async () =>
          kind === "admin"
            ? {
                id: "staff_1",
                userId: "user_admin",
                status: "ACTIVE",
                role: "ADMIN",
                isSystem: false,
                coach: null,
                roleDefinition: {
                  id: "role_super_admin",
                  key: "super_admin",
                  status: "ACTIVE",
                  allAccess: true,
                  permissions: [],
                },
              }
            : null,
        ),
      },
    } as never,
    now: () => new Date("2026-09-19T00:00:00+08:00"),
    resolveUser: async () =>
      kind === "anon"
        ? null
        : {
            id: kind === "admin" ? "user_admin" : "user_cust",
            email: "a@b.c",
            authMethod: "email",
          },
    storage: {
      createSignedUpload: async () => ({ signedUrl: "x", token: "t", path: "p" }),
      createSignedUrl: async () => "https://signed.example/proof",
      remove: async () => undefined,
      publicUrl: () => "https://public.example/x",
    },
  };
}

describe("admin 403", () => {
  it("rejects customer tokens on every admin path", async () => {
    const res = await dispatch(
      new Request("http://local/api/admin/bookings?tab=pending", { method: "GET" }),
      deps("customer"),
    );
    expect(res.status).toBe(403);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("forbidden");
  });

  it("rejects anonymous tokens on admin paths", async () => {
    const res = await dispatch(
      new Request("http://local/api/admin/settings", { method: "GET" }),
      deps("anon"),
    );
    expect(res.status).toBe(401);
  });
});
