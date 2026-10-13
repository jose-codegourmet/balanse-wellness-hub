import type { CustomerProfile, CustomerProfilePatch } from "@balanse/domain";

/** Server actions return a result instead of throwing so messages survive production builds. */
export type ActionResult<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Profile and avatar writes retain server actions because avatar uploads use a
 * signed-storage lifecycle. Onboarding answers use React Query mutations.
 */
export type CustomerProfileActions = {
  patchProfile: (patch: CustomerProfilePatch) => Promise<ActionResult<CustomerProfile>>;
  /** Cropped data URL from `AvatarUploader`, or null to remove the photo. */
  setAvatar: (avatar: { dataUrl: string } | null) => Promise<ActionResult<CustomerProfile>>;
};
