import type { SettingsFormValues } from "./settings-form.schema";

export const settingsFormDefaultValues: SettingsFormValues = {
  businessName: "",
  contact: { phone: "", address: "", email: "" },
  gcashName: "",
  gcashNumber: "",
  qrImageKey: null,
  about: "",
  faqs: [],
  openingHours: "",
};
