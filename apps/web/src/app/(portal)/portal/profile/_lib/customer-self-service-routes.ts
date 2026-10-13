import type { CustomerProfileActions } from "./customer-self-service.types";
import { patchMyProfileAction, setMyAvatarAction } from "./customer-self-service-actions";

/** Server-action bundles routes pass to client screens (server components only). */
export const customerProfileServerActions: CustomerProfileActions = {
  patchProfile: patchMyProfileAction,
  setAvatar: setMyAvatarAction,
};
