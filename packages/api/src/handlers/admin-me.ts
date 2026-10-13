import { requireActiveStaff, resolveActor } from "../auth";
import { type ApiDeps, staffAuthorizationOf } from "../deps";
import { ok } from "../http";

/**
 * WIRE-0202 (#357). `staffOnly` + empty `anyOf` in `ADMIN_API_ACCESS` means
 * `dispatch()`'s `authorizeAdminRequest` already turned "no session" into a
 * 401 and "signed in but not active staff" into a 403 before this handler
 * ever runs — so reaching here means the actor is already an active,
 * interactive staff member. `apps/admin`'s session module reads those status
 * codes to classify guest vs. non-staff vs. staff.
 */
export async function getAdminMe(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireActiveStaff(await resolveActor(deps, req));
  const staff = await deps.prisma.staffMember.findUniqueOrThrow({
    where: { id: actor.staffId },
    select: {
      name: true,
      roleDefinition: { select: { name: true } },
      profile: { select: { avatarKey: true } },
    },
  });
  const avatarUrl = staff.profile.avatarKey
    ? await deps.storage.createSignedUrl("avatars", staff.profile.avatarKey, 600).catch(() => null)
    : null;
  return ok(
    {
      actor: {
        ...staffAuthorizationOf(actor),
        name: staff.name,
        roleName: staff.roleDefinition.name,
        avatarUrl,
      },
    },
    { "Cache-Control": "no-store" },
  );
}
