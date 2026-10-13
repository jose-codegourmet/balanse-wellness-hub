import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentMethodForm } from "./PaymentMethodForm";

const meta: Meta<typeof PaymentMethodForm> = {
  title: "Portal/Payment method form",
  component: PaymentMethodForm,
  tags: ["autodocs"],
  args: {
    amountLabel: "₱550.00",
    deadlineLabel: "6:00 PM on Tue, Oct 13, 2026",
    submitting: false,
    onSubmit: () => undefined,
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const HeldUntilClassStart: Story = { args: { deadlineLabel: null } };
export const Submitting: Story = { args: { submitting: true } };
export const Package: Story = {
  args: { context: "package", amountLabel: "₱4,800.00", deadlineLabel: undefined },
};
