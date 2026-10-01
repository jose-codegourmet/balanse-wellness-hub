import type { AvatarValidationError, PersonName } from "@balanse/domain";

/**
 * # AvatarUploader (#351, reused by onboarding #352)
 *
 * Member photo control: the current `UserAvatar` (xl) with **Upload photo** /
 * **Change photo** and **Remove**.
 *
 * 1. File input `accept="image/jpeg,image/png,image/webp"` (no `capture`, so
 *    mobile offers camera or library).
 * 2. `validateAvatarFile` + `AVATAR_VALIDATION_COPY` from `@balanse/domain`:
 *    type and ≤ 5 MB, shown inline.
 * 3. Crop dialog with a **circular mask** (`react-easy-crop`, chosen for its
 *    small footprint, round crop shape, pinch/drag and arrow-key support),
 *    zoom slider 1–3× plus zoom buttons for keyboard users, Cancel / Save.
 * 4. Save renders the crop to a 512×512 canvas (`AVATAR_OUTPUT_SIZE`) on a
 *    white background (transparent PNGs), WEBP with JPEG fallback, and calls
 *    `onSave(dataUrl)`. EXIF orientation is respected:
 *    `createImageBitmap(file, { imageOrientation: "from-image" })`.
 * 5. Remove opens a confirm, then `onSave`'s sibling `onRemove()`; the avatar
 *    falls back to initials.
 *
 * `onSave` / `onRemove` resolve to an error message (string) or null. The
 * component shows the loading state and the success / error toast.
 *
 * ## When not to use
 *
 * Coach photos or marketing images (`ImageUpload`). Public surfaces never
 * upload.
 */
export type AvatarUploaderProps = {
  /** Used for the initials fallback and the accessible name. */
  name: PersonName;
  avatarUrl: string | null;
  /** Stable seed for the initials tone (customer id). */
  seed?: string;
  /** Persist the cropped data URL. Resolve to an error message, or null on success. */
  onSave: (dataUrl: string) => Promise<string | null>;
  /** Remove the photo. Resolve to an error message, or null on success. */
  onRemove: () => Promise<string | null>;
  disabled?: boolean;
  className?: string;
  /** Storybook: open in a given state. */
  initialState?: AvatarUploaderInitialState;
};

export type AvatarUploaderInitialState =
  | { kind: "crop"; imageSrc: string }
  | { kind: "error"; error: AvatarValidationError }
  | { kind: "saving"; imageSrc: string }
  | { kind: "remove-confirm" };

export const avatarUploaderMeta = {
  purpose: "Pick, validate, circle-crop and save a member avatar, or remove it.",
  whenToUse: "Portal profile (Basic profile) and the onboarding 'You' step.",
  whenNotToUse: "Coach photos, marketing images, or any public surface.",
  library: "react-easy-crop",
} as const;
