import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";

export async function loadPublicSchedule(): Promise<{
  sessions: PublicSession[];
  classes: PublicClass[];
  coaches: PublicCoach[];
  loadError: boolean;
}> {
  try {
    const adapter = getMockAdapter();
    const [sessions, classes, coaches] = await Promise.all([
      adapter.getPublicSessions(),
      adapter.getPublicClasses(),
      adapter.getPublicCoaches(),
    ]);
    return { sessions, classes, coaches, loadError: false };
  } catch {
    return { sessions: [], classes: [], coaches: [], loadError: true };
  }
}
