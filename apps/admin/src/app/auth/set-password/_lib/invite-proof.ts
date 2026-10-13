import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "balanse-staff-invite";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/auth/set-password",
};
const LIFETIME_SECONDS = 600;

function signature(payload: string): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Staff invitations are not configured.");
  return createHmac("sha256", key).update(`staff-invite:${payload}`).digest("base64url");
}

/** Short-lived, server-signed proof permits retrying a rejected password after
 * the single-use invitation was consumed. An ordinary login is not sufficient. */
export function inviteTokenDigest(tokenHash: string): string {
  return createHash("sha256").update(tokenHash).digest("hex");
}

export async function readInviteProof(): Promise<{
  userId: string;
  tokenDigest: string;
  tokenType: "invite" | "recovery";
} | null> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value || value.length > 1024) return null;
  try {
    const [payload, mac, extra] = value.split(".");
    if (!payload || !mac || extra) return null;
    const actual = Buffer.from(mac, "base64url");
    const expected = Buffer.from(signature(payload), "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const proof: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      !proof ||
      typeof proof !== "object" ||
      !("userId" in proof) ||
      !("expiresAt" in proof) ||
      !("tokenDigest" in proof) ||
      typeof proof.tokenDigest !== "string" ||
      typeof proof.userId !== "string" ||
      typeof proof.expiresAt !== "number" ||
      proof.expiresAt <= Date.now()
    )
      return null;
    const tokenType = "tokenType" in proof ? proof.tokenType : "invite";
    if (tokenType !== "invite" && tokenType !== "recovery") return null;
    return { userId: proof.userId, tokenDigest: proof.tokenDigest, tokenType };
  } catch {
    return null;
  }
}

export async function setInviteProof(
  userId: string,
  tokenHash: string,
  tokenType: "invite" | "recovery" = "invite",
): Promise<void> {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      tokenDigest: inviteTokenDigest(tokenHash),
      tokenType,
      expiresAt: Date.now() + LIFETIME_SECONDS * 1000,
    }),
  ).toString("base64url");
  (await cookies()).set(COOKIE_NAME, `${payload}.${signature(payload)}`, {
    ...COOKIE_OPTIONS,
    maxAge: LIFETIME_SECONDS,
  });
}

export async function clearInviteProof(): Promise<void> {
  (await cookies()).set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}
