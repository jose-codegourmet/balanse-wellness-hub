/**
 * #344 — `Profile.fullName` is a deprecated column derived by the database
 * (`trim(firstName || ' ' || lastName)`). Writers set `firstName` / `lastName`.
 * Legacy payloads that still carry a single full name are split on the first
 * space, matching the migration backfill ("Maria Clara Santos" → "Maria" /
 * "Clara Santos").
 */
export function splitLegacyFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const space = trimmed.indexOf(" ");
  if (space === -1) return { firstName: trimmed, lastName: "" };
  return { firstName: trimmed.slice(0, space), lastName: trimmed.slice(space + 1) };
}
