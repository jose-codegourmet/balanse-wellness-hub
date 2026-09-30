import { SETTINGS_SECTIONS, type SettingsSection } from "@balanse/domain";

export const SETTINGS_TAB_LABELS: Record<SettingsSection, string> = {
  business: "Business profile",
  payment: "Payment info",
  content: "Public content",
  policies: "Policies & waivers",
};

/**
 * Sections shown as Settings tabs. GCash payment details live on `/payment-qr`
 * with the receive-QR collection, so "payment" is not a tab here.
 */
export type SettingsTab = Exclude<SettingsSection, "payment">;

export const SETTINGS_TABS = SETTINGS_SECTIONS.filter(
  (id): id is SettingsTab => id !== "payment",
).map((id) => ({
  id,
  label: SETTINGS_TAB_LABELS[id],
}));

export function settingsSectionHref(id: SettingsSection): string {
  return `#settings-${id}`;
}
