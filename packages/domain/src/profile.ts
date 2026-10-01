/**
 * Customer identity display rules (#343). Public surfaces show a display name
 * (nickname, else first name) and an avatar or initials — never a last name.
 */

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 30;
export const PERSON_NAME_MAX = 50;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AvatarMimeType = (typeof AVATAR_MIME_TYPES)[number];
/** Square edge in pixels for the cropped avatar we store. */
export const AVATAR_OUTPUT_SIZE = 512;

export type PersonName = { firstName: string; lastName: string };

/** Nickname when set, otherwise first name. Never includes the last name. */
export function getDisplayName(person: { nickname?: string | null; firstName: string }): string {
  const nickname = person.nickname?.trim();
  if (nickname) return nickname;
  return person.firstName.trim() || "Member";
}

/** Up to two uppercase letters. Safe for an empty last name. */
export function getInitials(person: PersonName): string {
  const first = person.firstName.trim().charAt(0);
  const last = person.lastName.trim().charAt(0);
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}

/** Public roster rows only carry initials; rebuild a PersonName for avatar fallbacks. */
export function nameFromInitials(initials: string): PersonName {
  return { firstName: initials.charAt(0), lastName: initials.charAt(1) };
}

export function joinFullName(person: PersonName): string {
  return `${person.firstName.trim()} ${person.lastName.trim()}`.trim();
}

/**
 * Splits a legacy full name on the first space ("Maria Clara Santos" →
 * "Maria" / "Clara Santos"). Mirrors the #344 backfill.
 */
export function splitFullName(fullName: string): PersonName {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const space = trimmed.indexOf(" ");
  if (space === -1) return { firstName: trimmed, lastName: "" };
  return { firstName: trimmed.slice(0, space), lastName: trimmed.slice(space + 1) };
}

export type AvatarTone = { background: string; foreground: string };

/** Brand-palette fallbacks for initials avatars. */
export const AVATAR_TONES: readonly AvatarTone[] = [
  { background: "var(--balanse-beige)", foreground: "var(--balanse-navy)" },
  { background: "var(--balanse-tan)", foreground: "var(--balanse-navy)" },
  { background: "var(--balanse-gold)", foreground: "var(--balanse-navy)" },
  { background: "var(--balanse-muted-brown)", foreground: "var(--balanse-warm-white)" },
  { background: "var(--balanse-navy)", foreground: "var(--balanse-warm-white)" },
];

/** Deterministic tone for a seed (customer id, roster key). */
export function avatarToneFor(seed: string): AvatarTone {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length] ?? AVATAR_TONES[0];
}

export function isAvatarMimeType(value: string): value is AvatarMimeType {
  return (AVATAR_MIME_TYPES as readonly string[]).includes(value);
}

export type AvatarValidationError = "type" | "size";

export function validateAvatarFile(file: {
  type: string;
  size: number;
}): AvatarValidationError | null {
  if (!isAvatarMimeType(file.type)) return "type";
  if (file.size > AVATAR_MAX_BYTES) return "size";
  return null;
}

export const AVATAR_VALIDATION_COPY: Record<AvatarValidationError, string> = {
  type: "Use a JPG, PNG or WEBP image.",
  size: "Photo must be 5 MB or smaller.",
};
