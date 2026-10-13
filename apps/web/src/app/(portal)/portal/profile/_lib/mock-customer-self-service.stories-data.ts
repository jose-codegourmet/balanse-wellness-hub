import { getMockAdapter } from "@balanse/mock";
import type { ActionResult, CustomerProfileActions } from "./customer-self-service.types";

async function attempt<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, value: await work() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Mock request failed." };
  }
}

/**
 * Storybook stand-in for profile/avatar server actions. Not for routes.
 */
export function mockCustomerSelfServiceActions(customerId: string): CustomerProfileActions {
  const adapter = getMockAdapter();
  return {
    patchProfile: (patch) => attempt(() => adapter.patchMe(customerId, patch)),
    setAvatar: (avatar) => attempt(() => adapter.setMyAvatar(customerId, avatar)),
  };
}
