import type { AcquisitionPackageSummary } from "./load-acquisition-payment";

export function sessionsLabel(summary: AcquisitionPackageSummary): string | null {
  const count = summary.sessionCreditCount;
  if (count === null) return null;
  return `${count} ${count === 1 ? "session" : "sessions"}`;
}

export function validityLabel(summary: AcquisitionPackageSummary): string {
  return summary.validityDays ? `${summary.validityDays} days after activation` : "No expiry date";
}
