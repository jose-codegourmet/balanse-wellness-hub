/**
 * `*Php` (number, pesos) ↔ `php_decimal` (fixed-point string, the API wire
 * format — `MONEY_UNIT` in `@balanse/domain`) mapping, centralized on the
 * client (#356 WIRE-0107) so forms keep today's `*Php`-suffixed field names
 * without each screen inlining its own `Number()`/`.toFixed(2)` conversion.
 * Mirrors the server's `money()`/`moneyValue()` convention in `@balanse/api`.
 */

/** Parses a `php_decimal` wire value into the number a form field expects. */
export function phpToNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Formats a form's `*Php` number back into the `php_decimal` wire string. */
export function numberToPhp(value: number): string {
  return value.toFixed(2);
}
