import { SETTINGS_SECTIONS, type SettingsSection } from "@balanse/domain";

export const SETTINGS_TAB_LABELS: Record<SettingsSection, string> = {
  business: "Business profile",
  payment: "Payment info",
  content: "Public content",
  policies: "Policies & waivers",
};

export const SETTINGS_TABS = SETTINGS_SECTIONS.map((id) => ({
  id,
  label: SETTINGS_TAB_LABELS[id],
}));

export function settingsSectionHref(id: SettingsSection): string {
  return `#settings-${id}`;
}
