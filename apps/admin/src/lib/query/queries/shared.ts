import type { StaffAuthorizationActor } from "@balanse/domain";

/** Keep query factories' actor-scoped call shape consistent across server and browser. */
export function withPrincipal<T>(
  actor: StaffAuthorizationActor | null | undefined,
  work: () => Promise<T>,
): Promise<T> {
  void actor;
  return work();
}
