import { classChangeRequestFixtures } from "@balanse/mock";
import type { PrismaClient } from "@prisma/client";

/** WIRE-2005 — the three historical Storybook requests, keyed by stable IDs. */
export async function seedClassChanges(prisma: PrismaClient): Promise<void> {
  for (const fixture of classChangeRequestFixtures) {
    await prisma.classChangeRequest.upsert({
      where: { id: fixture.id },
      create: {
        id: fixture.id,
        sessionId: fixture.sessionId,
        kind: fixture.kind,
        status: fixture.status,
        reason: fixture.reason,
        requestedByStaffId: fixture.requestedByStaffId,
        requestedByCoachId: fixture.requestedByCoachId,
        sessionClassName: fixture.session.className,
        sessionStartsAt: new Date(fixture.session.startsAt),
        sessionEndsAt: new Date(fixture.session.endsAt),
        sessionCoachName: fixture.session.coachName,
        proposedStartsAt: fixture.proposedStartsAt ? new Date(fixture.proposedStartsAt) : null,
        proposedEndsAt: fixture.proposedEndsAt ? new Date(fixture.proposedEndsAt) : null,
        substituteCoachId: fixture.substituteCoachId,
        reviewedAt: fixture.reviewedAt ? new Date(fixture.reviewedAt) : null,
        reviewedByStaffId: fixture.reviewedByStaffId,
        decisionNote: fixture.decisionNote,
        createdAt: new Date(fixture.createdAt),
      },
      // Re-seeding must never reopen a resolved request or erase a real review.
      update: {},
    });
  }
}
