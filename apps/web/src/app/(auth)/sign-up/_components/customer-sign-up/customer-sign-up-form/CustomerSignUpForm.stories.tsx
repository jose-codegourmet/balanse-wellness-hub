import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerSignUpForm } from "./CustomerSignUpForm";
import {
  customerSignUpFormDefaultValues,
  customerSignUpGoogleDefaults,
} from "./CustomerSignUpForm.defaults";

const meta = {
  title: "Auth/Customer sign-up form",
  component: CustomerSignUpForm,
  tags: ["autodocs"],
  args: {
    defaultValues: customerSignUpFormDefaultValues,
    onSubmit: () => undefined,
  },
} satisfies Meta<typeof CustomerSignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValues: {
      ...customerSignUpFormDefaultValues,
      firstName: "Gia",
      lastName: "Ramos",
      email: "gia.ramos@example.com",
      contactNumber: "+63 917 555 0101",
      password: "balanse-2026",
      confirmPassword: "balanse-2026",
    },
  },
};

/** Mock Google prefill: names and email from `given_name` / `family_name`, no password. */
export const GooglePrefill: Story = {
  args: {
    defaultValues: customerSignUpGoogleDefaults({
      givenName: "Gia",
      familyName: "Ramos",
      email: "gia.ramos@example.com",
    }),
  },
};

export const Submitting: Story = { args: { submitting: true } };

export const ActionFailed: Story = {
  args: { formError: "We couldn't create your account. Try again." },
};
