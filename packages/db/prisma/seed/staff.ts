import { mockStaffMembers, mockStaffRoles } from "@balanse/mock";
import type { PrismaClient } from "@prisma/client";
import { seedAuthStaff } from "./auth";
import { seedId } from "./ids";

function names(name: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName: firstName || "Staff", lastName: rest.join(" ") };
}

/**
 * Seeds the same three custom roles used by the staff fixture plus its seven
 * representative identities. The fixture remains the source of the custom
 * role matrices; built-ins are seeded by constants/staff-roles first.
 */
export async function seedStaff(prisma: PrismaClient): Promise<void> {
  const customRoles = mockStaffRoles.filter((role) => !role.builtIn);
  for (const role of customRoles) {
    const persisted = await prisma.staffRoleDefinition.upsert({
      where: { key: role.key },
      create: {
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        builtIn: false,
        allAccess: false,
        status: "ACTIVE",
      },
      update: { name: role.name, description: role.description, status: "ACTIVE" },
    });
    await prisma.staffRolePermission.deleteMany({ where: { roleId: persisted.id } });
    await prisma.staffRolePermission.createMany({
      data: role.permissionKeys.map((permissionId) => ({
        id: `${persisted.id}:${permissionId}`,
        roleId: persisted.id,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }

  await seedAuthStaff(
    prisma,
    mockStaffMembers.map((member) => ({
      mockId: member.id,
      email: member.email,
      ...names(member.name),
    })),
  );

  const frontDesk = await prisma.staffRoleDefinition.findUniqueOrThrow({
    where: { key: "front_desk" },
    select: { id: true },
  });
  for (const member of mockStaffMembers) {
    const fixtureRole = mockStaffRoles.find((role) => role.id === member.roleId);
    if (!fixtureRole) throw new Error(`Missing fixture role for ${member.id}.`);
    const role = await prisma.staffRoleDefinition.findUniqueOrThrow({
      where: { key: fixtureRole.key },
      select: { id: true },
    });
    // The database rejects a Coach role until a Coach row points at this
    // staff member. Provision with a non-Coach role, link, then assign Coach.
    const initialRoleId = fixtureRole.key === "coach" ? frontDesk.id : role.id;
    const staff = await prisma.staffMember.upsert({
      where: { userId: seedId(member.id) },
      create: {
        id: member.id,
        userId: seedId(member.id),
        name: member.name,
        email: member.email,
        role: member.role,
        roleId: initialRoleId,
        status: member.status === "active" ? "ACTIVE" : "DISABLED",
      },
      update: {
        name: member.name,
        email: member.email,
        role: member.role,
        roleId: initialRoleId,
        status: member.status === "active" ? "ACTIVE" : "DISABLED",
      },
    });
    if (member.coachId) {
      const coach = await prisma.coach.findUniqueOrThrow({ where: { id: member.coachId } });
      if (coach.staffMemberId && coach.staffMemberId !== staff.id) {
        throw new Error(`Coach ${member.coachId} is already linked to another staff member.`);
      }
      const previousCoach = await prisma.coach.findUnique({
        where: { staffMemberId: staff.id },
      });
      if (previousCoach && previousCoach.id !== coach.id) {
        await prisma.coach.update({
          where: { id: previousCoach.id },
          data: { staffMemberId: null },
        });
      }
      await prisma.coach.update({
        where: { id: coach.id },
        data: { staffMemberId: staff.id },
      });
    }
    if (initialRoleId !== role.id) {
      await prisma.staffMember.update({
        where: { id: staff.id },
        data: { roleId: role.id },
      });
    }
  }
}
