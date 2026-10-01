import { getMockAdapter } from "@balanse/mock";
import type { ActionResult, CustomerOnboardingActions } from "./customer-self-service.types";

async function attempt<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, value: await work() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Mock request failed." };
  }
}

/**
 * Storybook stand-in for the self-service server actions: the same adapter
 * calls against the in-browser mock store. Not for routes.
 */
export function mockCustomerSelfServiceActions(customerId: string): CustomerOnboardingActions {
  const adapter = getMockAdapter();
  return {
    patchProfile: (patch) => attempt(() => adapter.patchMe(customerId, patch)),
    setAvatar: (avatar) => attempt(() => adapter.setMyAvatar(customerId, avatar)),
    saveAnswers: (patch) => attempt(() => adapter.saveMyOnboarding(customerId, patch)),
    complete: () => attempt(() => adapter.completeOnboarding(customerId)),
    skip: () => attempt(() => adapter.skipOnboarding(customerId)),
  };
}
