import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { rememberSeedId } from "./ids";

export type DemoCustomerSeed = {
  mockId: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  email: string;
  contactNumber: string;
  showOnPublicRoster: boolean;
  referralCode: string;
  onboardingStatus: "not_started" | "in_progress" | "skipped" | "completed";
};

export type DemoStaffSeed = {
  mockId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export async function provisionAuthUser(seed: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<string> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return randomUUID();
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      email: seed.email,
      email_confirm: true,
      user_metadata: { first_name: seed.firstName, last_name: seed.lastName },
    }),
  });
  if (response.ok) return ((await response.json()) as { id: string }).id;
  const existing = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  const users = existing.ok
    ? (((await existing.json()) as { users?: Array<{ id: string; email?: string }> }).users ?? [])
    : [];
  const match = users.find((user) => user.email?.toLowerCase() === seed.email.toLowerCase());
  if (!match) throw new Error(`Unable to create auth user for ${seed.email}.`);
  return match.id;
}

export async function seedAuthCustomers(
  prisma: PrismaClient,
  customers: readonly DemoCustomerSeed[],
): Promise<void> {
  if (process.env.BALANSE_ALLOW_AUTH_SEED !== "1")
    throw new Error("Refusing auth seed. Set BALANSE_ALLOW_AUTH_SEED=1 explicitly.");
  for (const customer of customers) {
    const id = await provisionAuthUser(customer);
    rememberSeedId(customer.mockId, id);
    await prisma.profile.upsert({
      where: { id },
      create: {
        id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        contactNumber: customer.contactNumber,
        customerRegisteredAt: new Date("2026-09-16T00:00:00Z"),
        nickname: customer.nickname,
        showOnPublicRoster: customer.showOnPublicRoster,
        referralCode: customer.referralCode,
        onboardingCompletedAt:
          customer.onboardingStatus === "completed" ? new Date("2026-09-16T00:00:00Z") : null,
        onboardingSkippedAt:
          customer.onboardingStatus === "skipped" ? new Date("2026-09-16T00:00:00Z") : null,
      },
      update: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        contactNumber: customer.contactNumber,
        customerRegisteredAt: new Date("2026-09-16T00:00:00Z"),
        nickname: customer.nickname,
        showOnPublicRoster: customer.showOnPublicRoster,
      },
    });
    if (
      [
        "cust-ben",
        "cust-m-01",
        "cust-m-03",
        "cust-m-05",
        "cust-m-07",
        "cust-m-08",
        "cust-m-10",
        "cust-m-12",
      ].includes(customer.mockId)
    ) {
      const keyPath = `avatars/${id}/placeholder.webp`;
      const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key) {
        const bytes = Buffer.from(
          "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEAAUAmJaQAA3AA/vuUAAA=",
          "base64",
        );
        const uploaded = await fetch(`${url}/storage/v1/object/avatars/${keyPath}`, {
          method: "POST",
          headers: {
            apikey: key,
            authorization: `Bearer ${key}`,
            "content-type": "image/webp",
            "x-upsert": "true",
          },
          body: bytes,
        });
        if (!uploaded.ok) throw new Error(`Unable to seed avatar for ${customer.email}.`);
        await prisma.profile.update({ where: { id }, data: { avatarKey: keyPath } });
      }
      // No service-role credentials: skip the upload and leave `avatarKey` unset
      // rather than pointing the DB at a storage object that was never written.
    }
  }
}

/** Creates the auth.users/profile side required by StaffMember.userId. */
export async function seedAuthStaff(
  prisma: PrismaClient,
  staff: readonly DemoStaffSeed[],
): Promise<void> {
  if (process.env.BALANSE_ALLOW_AUTH_SEED !== "1") {
    throw new Error("Refusing auth seed. Set BALANSE_ALLOW_AUTH_SEED=1 explicitly.");
  }
  for (const member of staff) {
    const id = await provisionAuthUser(member);
    rememberSeedId(member.mockId, id);
    await prisma.profile.upsert({
      where: { id },
      create: {
        id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        contactNumber: "",
      },
      update: { firstName: member.firstName, lastName: member.lastName, email: member.email },
    });
  }
}
