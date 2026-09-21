import { flattenFaqs } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  businessProfileFormDefaultValues,
  paymentInfoFormDefaultValues,
  policyPromoteFormDefaultValues,
  publicContentFormDefaultValues,
  settingsFormDefaultValues,
} from "@/modules/admin/forms/settings/settings-form.defaults";
import {
  businessProfileFormSchema,
  paymentInfoFormSchema,
  policyPromoteFormSchema,
  publicContentFormSchema,
  settingsFormSchema,
} from "@/modules/admin/forms/settings/settings-form.schema";
import { SettingsPage } from "./SettingsPage";

const faqs = flattenFaqs();

const meta = {
  title: "Admin/Screens/Settings",
  component: SettingsPage,
  tags: ["autodocs"],
  parameters: {
    settingsFormSchema,
    settingsFormDefaultValues,
    businessProfileFormSchema,
    businessProfileFormDefaultValues,
    paymentInfoFormSchema,
    paymentInfoFormDefaultValues,
    publicContentFormSchema,
    publicContentFormDefaultValues,
    policyPromoteFormSchema,
    policyPromoteFormDefaultValues,
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BusinessProfile: Story = {
  args: { initialTab: "business" },
};

export const PaymentInfo: Story = {
  args: { initialTab: "payment" },
};

export const PublicContent: Story = {
  args: { initialTab: "content" },
};

export const Policies: Story = {
  args: { initialTab: "policies" },
};

/** Empty required fields — submit in the canvas to see FieldError + summary. */
export const ValidationErrors: Story = {
  args: { initialTab: "business", emptySection: true },
};

export const FaqEmpty: Story = {
  args: { initialTab: "content", faqsOverride: [] },
};

export const FaqSingle: Story = {
  args: { initialTab: "content", faqsOverride: faqs.slice(0, 1) },
};

export const FaqFive: Story = {
  args: { initialTab: "content", faqsOverride: faqs.slice(0, 5) },
};

/** Use Move up / Move down — each FAQ stays intact (the old textarea collapsed the list). */
export const FaqReorder: Story = {
  args: { initialTab: "content", faqsOverride: faqs.slice(0, 5) },
};

export const PolicyPromote: Story = {
  args: { initialTab: "policies" },
};

export const PolicyInvalidVersion: Story = {
  args: { initialTab: "policies", invalidPolicyVersion: true },
};

export const Saving: Story = {
  args: { initialTab: "business" },
  parameters: { mockRuntime: { latencyMs: 10_000 } },
};

export const SaveFailure: Story = {
  args: { initialTab: "business" },
  parameters: { mockRuntime: { failNext: true } },
};

export const Mobile: Story = {
  args: { initialTab: "business" },
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const Tablet: Story = {
  args: { initialTab: "content" },
  parameters: { viewport: { defaultViewport: "tablet" } },
};

export const Desktop: Story = {
  args: { initialTab: "policies" },
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const Dark: Story = {
  args: { initialTab: "content" },
  globals: { theme: "dark" },
};
