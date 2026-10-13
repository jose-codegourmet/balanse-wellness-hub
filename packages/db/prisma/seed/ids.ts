/** Runtime mapping from stable mock fixture ids to the auth UUIDs created by seed/auth. */
export const seededIds = new Map<string, string>();
export function rememberSeedId(mockId: string, authUserId: string): void {
  seededIds.set(mockId, authUserId);
}
export function seedId(mockId: string): string {
  const id = seededIds.get(mockId);
  if (!id) throw new Error(`Missing seeded auth id for ${mockId}. Run seed/auth first.`);
  return id;
}
