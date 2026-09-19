import { requireCustomer, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson } from "../http";

export async function getMe(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const profile = await deps.prisma.profile.findUnique({ where: { id: actor.userId } });
  if (!profile) throw new ApiError(404, "profile_not_found", "Profile not found.");
  return ok({
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    contactNumber: profile.contactNumber,
    authMethod: actor.authMethod,
  });
}

export async function patchMe(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  const fields: Record<string, string> = {};
  const fullName = asString(body.fullName);
  const contactNumber = asString(body.contactNumber);
  if (fullName !== undefined && !fullName.trim()) fields.fullName = "Full name is required.";
  if (contactNumber !== undefined && !contactNumber.trim()) {
    fields.contactNumber = "Contact number is required.";
  }
  if ("email" in body) {
    fields.email = "Email changes follow the auth provider flow and cannot be patched here.";
  }
  if (Object.keys(fields).length > 0) {
    throw new ApiError(400, "validation_error", "Profile update failed validation.", { fields });
  }
  const data: { fullName?: string; contactNumber?: string } = {};
  if (fullName !== undefined) data.fullName = fullName.trim();
  if (contactNumber !== undefined) data.contactNumber = contactNumber.trim();
  const profile = await deps.prisma.profile.update({
    where: { id: actor.userId },
    data,
  });
  return ok({
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    contactNumber: profile.contactNumber,
    authMethod: actor.authMethod,
  });
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
