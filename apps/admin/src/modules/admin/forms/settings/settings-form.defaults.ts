import type {
  BusinessProfileFormValues,
  PaymentInfoFormValues,
  PolicyPromoteFormValues,
  PublicContentFormValues,
  SettingsFormValues,
} from "./settings-form.schema";

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

export const businessProfileFormDefaultValues: BusinessProfileFormValues = {
  businessName: "",
  contact: { phone: "", address: "" },
  openingHours: "",
};

export const paymentInfoFormDefaultValues: PaymentInfoFormValues = {
  gcashName: "",
  gcashNumber: "",
};

export const publicContentFormDefaultValues: PublicContentFormValues = {
  about: "",
  contact: { email: "" },
  faqs: [],
};

export const policyPromoteFormDefaultValues: PolicyPromoteFormValues = {
  version: "",
};
