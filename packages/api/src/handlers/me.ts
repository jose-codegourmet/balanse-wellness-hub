import { randomUUID } from "node:crypto";
import { requireCustomer, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson } from "../http";
import { splitLegacyFullName } from "../profile-names";

const AVATAR_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const AVATAR_SIGNED_URL_SECONDS = 600;

function onboardingStatus(profile: {
  onboardingCompletedAt: Date | null;
  onboardingSkippedAt: Date | null;
  onboarding: unknown;
}): "not_started" | "in_progress" | "skipped" | "completed" {
  if (profile.onboardingCompletedAt) return "completed";
  if (profile.onboardingSkippedAt) return "skipped";
  return profile.onboarding ? "in_progress" : "not_started";
}

async function presentMe(
  deps: ApiDeps,
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    nickname: string | null;
    avatarKey: string | null;
    showOnPublicRoster: boolean;
    referralCode: string;
    referralChannel: "CUSTOMER_LINK" | "CUSTOMER_QR" | "STUDIO_LINK" | "STUDIO_QR" | null;
    onboardingCompletedAt: Date | null;
    onboardingSkippedAt: Date | null;
    onboarding: unknown;
    email: string;
    contactNumber: string;
  },
  authMethod: "google" | "email",
) {
  const avatarUrl = profile.avatarKey
    ? await deps.storage.createSignedUrl("avatars", profile.avatarKey, AVATAR_SIGNED_URL_SECONDS)
    : null;
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: `${profile.firstName} ${profile.lastName}`.trim() || profile.fullName,
    nickname: profile.nickname,
    avatarUrl,
    showOnPublicRoster: profile.showOnPublicRoster,
    referralCode: profile.referralCode,
    onboardingStatus: onboardingStatus(profile),
    referralChannel: profile.referralChannel,
    email: profile.email,
    contactNumber: profile.contactNumber,
    authMethod,
  };
}

async function profileForMe(deps: ApiDeps, id: string) {
  const profile = await deps.prisma.profile.findUnique({
    where: { id },
    include: { onboarding: { select: { profileId: true } } },
  });
  if (!profile) throw new ApiError(404, "profile_not_found", "Profile not found.");
  return profile;
}

export async function getMe(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  return ok(await presentMe(deps, await profileForMe(deps, actor.userId), actor.authMethod));
}

export async function patchMe(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  const fields: Record<string, string> = {};
  const fullName = asString(body.fullName);
  const firstName = asString(body.firstName);
  const lastName = asString(body.lastName);
  const nickname = body.nickname === null ? null : asString(body.nickname);
  const contactNumber = asString(body.contactNumber);
  if (fullName !== undefined && !fullName.trim()) fields.fullName = "Full name is required.";
  if (firstName !== undefined && !firstName.trim()) fields.firstName = "First name is required.";
  if (lastName !== undefined && !lastName.trim()) fields.lastName = "Last name is required.";
  if (
    nickname !== undefined &&
    nickname !== null &&
    (nickname.trim().length < 2 || nickname.trim().length > 30)
  ) {
    fields.nickname = "Nickname must be 2–30 characters.";
  }
  if (contactNumber !== undefined && !contactNumber.trim()) {
    fields.contactNumber = "Contact number is required.";
  }
  if ("email" in body) {
    fields.email = "Email changes follow the auth provider flow and cannot be patched here.";
  }
  if (Object.keys(fields).length > 0) {
    throw new ApiError(400, "validation_error", "Profile update failed validation.", { fields });
  }
  const data: {
    firstName?: string;
    lastName?: string;
    nickname?: string | null;
    contactNumber?: string;
    showOnPublicRoster?: boolean;
  } = {};
  // fullName is derived in the database (#344); write the split instead.
  if (fullName !== undefined) Object.assign(data, splitLegacyFullName(fullName));
  if (firstName !== undefined) data.firstName = firstName.trim();
  if (lastName !== undefined) data.lastName = lastName.trim();
  if (nickname !== undefined) data.nickname = nickname === null ? null : nickname.trim();
  if (contactNumber !== undefined) data.contactNumber = contactNumber.trim();
  if (typeof body.showOnPublicRoster === "boolean") {
    data.showOnPublicRoster = body.showOnPublicRoster;
  }
  const profile = await deps.prisma.profile.update({
    where: { id: actor.userId },
    data,
    include: { onboarding: { select: { profileId: true } } },
  });
  return ok(await presentMe(deps, profile, actor.authMethod));
}

/** Mint (no objectKey) or confirm (objectKey) the customer's avatar upload. */
export async function postMyAvatar(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  const objectKey = asString(body.objectKey)?.trim();
  if (!objectKey) {
    const contentType = asString(body.contentType)?.trim() ?? "";
    if (!AVATAR_CONTENT_TYPES.has(contentType)) {
      throw new ApiError(400, "validation_error", "Unsupported avatar type.", {
        fields: { contentType: "Choose a JPG, PNG, or WEBP image." },
      });
    }
    const key = `avatars/${actor.userId}/${randomUUID()}.webp`;
    const upload = await deps.storage.createSignedUpload("avatars", key, { contentType });
    await deps.prisma.pendingUpload.create({
      data: {
        bucket: "avatars",
        objectKey: key,
        purpose: "profile_avatar",
        entityId: actor.userId,
        profileId: actor.userId,
      },
    });
    return ok({
      upload: {
        signedUrl: upload.signedUrl,
        token: upload.token,
        path: upload.path,
        expiresIn: 600,
      },
      objectKey: key,
      bucket: "avatars",
      maxBytes: 5 * 1024 * 1024,
      contentTypes: [...AVATAR_CONTENT_TYPES],
    });
  }

  const pending = await deps.prisma.pendingUpload.findFirst({
    where: {
      objectKey,
      bucket: "avatars",
      purpose: "profile_avatar",
      profileId: actor.userId,
      confirmedAt: null,
    },
  });
  if (!pending) throw new ApiError(400, "invalid_object_key", "Avatar upload was not found.");
  const profile = await profileForMe(deps, actor.userId);
  await deps.prisma.$transaction([
    deps.prisma.profile.update({ where: { id: actor.userId }, data: { avatarKey: objectKey } }),
    deps.prisma.pendingUpload.update({
      where: { id: pending.id },
      data: { confirmedAt: deps.now() },
    }),
  ]);
  if (profile.avatarKey && profile.avatarKey !== objectKey) {
    await deps.storage.remove("avatars", [profile.avatarKey]);
  }
  return ok(await presentMe(deps, await profileForMe(deps, actor.userId), actor.authMethod));
}

export async function deleteMyAvatar(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const profile = await profileForMe(deps, actor.userId);
  await deps.prisma.profile.update({ where: { id: actor.userId }, data: { avatarKey: null } });
  if (profile.avatarKey) await deps.storage.remove("avatars", [profile.avatarKey]);
  return ok(await presentMe(deps, await profileForMe(deps, actor.userId), actor.authMethod));
}

export async function getPolicyAcceptances(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const rows = await deps.prisma.bookingPolicyAcceptance.findMany({
    where: { profileId: actor.userId },
    orderBy: { acceptedAt: "desc" },
    include: { policyVersion: { include: { document: true } } },
  });
  return ok({
    items: rows.map((row) => ({
      documentName: row.policyVersion.document.title,
      documentSlug: row.policyVersion.document.slug,
      version: row.policyVersion.version,
      acceptedAt: row.acceptedAt.toISOString(),
      bookingId: row.bookingId,
    })),
    requiredCurrent: (
      await deps.prisma.policyDocumentVersion.findMany({
        where: { isCurrent: true, document: { required: true } },
        include: { document: true },
      })
    ).map((version) => ({
      documentName: version.document.title,
      version: version.version,
      versionId: version.id,
    })),
  });
}

/** Records immutable consent outside the booking reservation transaction (WIRE-1604). */
export async function postPolicyAcceptances(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  const forms = new Set([
    "sign_up",
    "booking",
    "package_request",
    "payment_proof",
    "reschedule",
    "cancellation",
    "contact",
  ]);
  const prismaForm = {
    sign_up: "SIGN_UP",
    booking: "BOOKING",
    package_request: "PACKAGE_REQUEST",
    payment_proof: "PAYMENT_PROOF",
    reschedule: "RESCHEDULE",
    cancellation: "CANCELLATION",
    contact: "CONTACT",
  } as const;
  const form = asString(body.form);
  if (!form || !forms.has(form)) {
    throw new ApiError(422, "validation_failed", "form must be a supported customer policy form.");
  }
  const policyVersionIds = Array.isArray(body.policyVersionIds)
    ? body.policyVersionIds.filter((id): id is string => typeof id === "string")
    : [];
  if (!policyVersionIds.length) {
    throw new ApiError(422, "validation_failed", "policyVersionIds must not be empty.");
  }
  const required = await deps.prisma.policyFormRequirement.findMany({
    where: { form: prismaForm[form as keyof typeof prismaForm] },
    include: {
      document: { include: { versions: { where: { isCurrent: true }, select: { id: true } } } },
    },
  });
  const requiredIds = new Set(
    required.flatMap((row) => row.document.versions.map((version) => version.id)),
  );
  if (policyVersionIds.some((id) => !requiredIds.has(id))) {
    throw new ApiError(
      422,
      "invalid_policy_version",
      "A policy version is not currently required for this form.",
    );
  }
  const bookingId = asString(body.bookingId);
  if (bookingId) {
    const booking = await deps.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { profileId: true },
    });
    if (!booking || booking.profileId !== actor.userId)
      throw new ApiError(404, "booking_not_found", "Booking not found.");
  }
  const acquisitionId = asString(body.acquisitionId);
  const acceptedAt = deps.now();
  await deps.prisma.$transaction(async (tx) => {
    for (const policyVersionId of [...new Set(policyVersionIds)]) {
      const existing = await tx.bookingPolicyAcceptance.findFirst({
        where: {
          profileId: actor.userId,
          form: prismaForm[form as keyof typeof prismaForm],
          policyVersionId,
          bookingId: bookingId ?? null,
          acquisitionId: acquisitionId ?? null,
        },
      });
      if (!existing) {
        await tx.bookingPolicyAcceptance.create({
          data: {
            profileId: actor.userId,
            form: prismaForm[form as keyof typeof prismaForm],
            policyVersionId,
            bookingId: bookingId ?? null,
            acquisitionId: acquisitionId ?? null,
            acceptedAt,
          },
        });
      }
    }
  });
  return ok({
    acceptedAt: acceptedAt.toISOString(),
    form,
    policyVersionIds: [...new Set(policyVersionIds)],
  });
}
