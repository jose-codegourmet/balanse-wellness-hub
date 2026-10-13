import { CONTACT_DETAILS, FAQ_GROUPS } from "@balanse/domain";
import type { PrismaClient } from "@prisma/client";

const PLACEHOLDER_BODY =
  "PLACEHOLDER — not legal text. OQ-4: replace with Coach Rex production copy. Do not treat this as a waiver or policy.";

/** Business profile, FAQs, and the two placeholder policy documents (WIRE-1608, #370). */
export async function seedSettings(prisma: PrismaClient): Promise<void> {
  const waiver = await prisma.policyDocument.upsert({
    where: { slug: "liability-waiver" },
    create: {
      id: "policy_waiver",
      kind: "WAIVER",
      slug: "liability-waiver",
      title: "Waiver",
      required: false,
    },
    update: { title: "Waiver", required: false },
  });
  const gymPolicy = await prisma.policyDocument.upsert({
    where: { slug: "gym-policy" },
    create: {
      id: "policy_gym",
      kind: "GYM_POLICY",
      slug: "gym-policy",
      title: "Gym Policy",
      required: false,
    },
    update: { title: "Gym Policy", required: false },
  });

  for (const doc of [waiver, gymPolicy]) {
    await prisma.policyDocumentVersion.upsert({
      where: { documentId_version: { documentId: doc.id, version: "2026-01" } },
      create: {
        id: `${doc.id}_v202601`,
        documentId: doc.id,
        version: "2026-01",
        title: `${doc.title} 2026-01`,
        body: PLACEHOLDER_BODY,
        effectiveFrom: new Date("2026-01-01T00:00:00+08:00"),
        isCurrent: true,
        isPlaceholder: true,
      },
      update: { body: PLACEHOLDER_BODY, isCurrent: true, isPlaceholder: true },
    });
  }

  await prisma.policyFormRequirement.deleteMany({ where: { form: "BOOKING" } });
  await prisma.policyFormRequirement.createMany({
    data: [
      { form: "BOOKING", documentId: waiver.id, sortOrder: 10 },
      { form: "BOOKING", documentId: gymPolicy.id, sortOrder: 20 },
    ],
  });

  const seedFaqs = FAQ_GROUPS.flatMap((group) => group.items);
  for (const [index, faq] of seedFaqs.entries()) {
    await prisma.faqItem.upsert({
      where: { id: `seed-faq-${index + 1}` },
      create: {
        id: `seed-faq-${index + 1}`,
        question: faq.question,
        answer: faq.answer,
        sortOrder: (index + 1) * 10,
      },
      update: { question: faq.question, answer: faq.answer, sortOrder: (index + 1) * 10 },
    });
  }

  await prisma.appMeta.upsert({
    where: { key: "public_settings" },
    create: {
      key: "public_settings",
      value: JSON.stringify({
        business: {
          name: "Balanse Wellness Hub",
          phone: CONTACT_DETAILS.phone,
          email: CONTACT_DETAILS.email,
          address: CONTACT_DETAILS.address,
          instagram: CONTACT_DETAILS.instagram,
          tiktok: CONTACT_DETAILS.tiktok,
          whatsapp: CONTACT_DETAILS.whatsapp,
          openingHours: "",
        },
        payment: {
          gcashAccountName: "",
          gcashNumber: "",
          gcashQrObjectKey: "",
          gcashQrPublicUrl: "",
        },
        content: { about: "", contact: "", faqs: [] },
      }),
    },
    update: {},
  });
}
