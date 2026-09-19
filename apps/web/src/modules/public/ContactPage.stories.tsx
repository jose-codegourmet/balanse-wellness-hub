import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PublicFooter, PublicHeader } from "@/modules/layout/PublicChrome";
import { ContactForm } from "./ContactForm";
import { ContactPage } from "./ContactPage";

const meta = {
  title: "Public/Contact",
  component: ContactPage,
  decorators: [
    (Story) => (
      <>
        <PublicHeader />
        <Story />
        <PublicFooter />
      </>
    ),
  ],
} satisfies Meta<typeof ContactPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FormSubmitting: Story = {
  render: () => <ContactForm forcedOutcome="submitting" />,
};

export const FormSuccess: Story = {
  render: () => <ContactForm forcedOutcome="success" />,
};

export const FormFailure: Story = {
  render: () => <ContactForm forcedOutcome="failure" />,
};
