import type { PrismaClient } from "@prisma/client";

type AccountSeed = {
  id: string;
  type: "GCASH" | "MAYA" | "QRPH";
  label: string;
  accountName: string;
  accountNumber: string;
  /** Set only for accounts with an image to actually upload; null otherwise. */
  imageSlug: string | null;
  isActive: boolean;
};

/** Mirrors `packages/mock/src/fixtures.ts`'s `paymentAccountFixtures` (WIRE-1706, #371). */
const ACCOUNTS: readonly AccountSeed[] = [
  {
    id: "pqr-gcash-main",
    type: "GCASH",
    label: "Studio GCash",
    accountName: "Balansé Wellness Hub (placeholder)",
    accountNumber: "0968 220 9198",
    imageSlug: "gcash-main",
    isActive: true,
  },
  {
    id: "pqr-maya-main",
    type: "MAYA",
    label: "Studio Maya",
    accountName: "Balansé Wellness Hub (placeholder)",
    accountNumber: "0917 555 0142",
    imageSlug: null,
    isActive: true,
  },
  {
    id: "pqr-qrph-bank",
    type: "QRPH",
    label: "Bank QR Ph",
    accountName: "Balansé Wellness Hub Inc. (placeholder)",
    accountNumber: "0012 3456 7890",
    imageSlug: "qrph-bank",
    isActive: false,
  },
];

/**
 * Uploads a placeholder QR image to `marketing-assets/settings/payment-qrs/`
 * and returns its key — or `null` when credentials are missing or the
 * upload fails. Never write a DB key with no backing object (the same bug
 * found and fixed in `seed/auth.ts` and `seed/bookings.ts` this epic).
 */
async function seedQrImage(slug: string): Promise<string | null> {
  const objectKey = `marketing-assets/settings/payment-qrs/${slug}.webp`;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const bytes = Buffer.from(
    "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEAAUAmJaQAA3AA/vuUAAA=",
    "base64",
  );
  const uploaded = await fetch(`${url}/storage/v1/object/${objectKey}`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "image/webp",
      "x-upsert": "true",
    },
    body: bytes,
  });
  return uploaded.ok ? objectKey : null;
}

export async function seedPaymentAccounts(prisma: PrismaClient): Promise<void> {
  for (const account of ACCOUNTS) {
    const imageKey = account.imageSlug ? await seedQrImage(account.imageSlug) : null;
    await prisma.paymentQrCode.upsert({
      where: { id: account.id },
      create: {
        id: account.id,
        type: account.type,
        label: account.label,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        imageKey,
        isActive: account.isActive,
      },
      update: {
        type: account.type,
        label: account.label,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        // Only set a known-good upload; never clobber a real admin-replaced
        // image (or a still-missing one) with this fixture's own null.
        ...(imageKey ? { imageKey } : {}),
      },
    });
  }
}
