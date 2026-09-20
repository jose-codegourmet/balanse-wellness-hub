export function countKeys(prefix: string, count: number): string[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => `${prefix}-${index + 1}`);
}
