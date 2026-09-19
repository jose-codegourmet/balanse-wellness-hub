import type { PublicClass, PublicSession } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";

export async function loadPublicSchedule(): Promise<{
  sessions: PublicSession[];
  classes: PublicClass[];
  loadError: boolean;
}> {
  try {
    const adapter = getMockAdapter();
    const [sessions, classes] = await Promise.all([
      adapter.getPublicSessions(),
      adapter.getPublicClasses(),
    ]);
    return { sessions, classes, loadError: false };
  } catch {
    return { sessions: [], classes: [], loadError: true };
  }
}
