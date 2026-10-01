import type {
  CustomerOnboardingActions,
  CustomerProfileActions,
} from "./customer-self-service.types";
import {
  completeMyOnboardingAction,
  patchMyProfileAction,
  saveMyOnboardingAction,
  setMyAvatarAction,
  skipMyOnboardingAction,
} from "./customer-self-service-actions";

/** Server-action bundles routes pass to client screens (server components only). */
export const customerProfileServerActions: CustomerProfileActions = {
  patchProfile: patchMyProfileAction,
  setAvatar: setMyAvatarAction,
};

export const customerOnboardingServerActions: CustomerOnboardingActions = {
  ...customerProfileServerActions,
  saveAnswers: saveMyOnboardingAction,
  complete: completeMyOnboardingAction,
  skip: skipMyOnboardingAction,
};
